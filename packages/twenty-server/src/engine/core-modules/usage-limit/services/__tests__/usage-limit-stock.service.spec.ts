import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { type FlatStockLimit } from 'src/engine/core-modules/usage-limit/types/flat-stock-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('UsageLimitStockService invalidation', () => {
  const scope = {
    workspaceId: 'workspace-1',
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenders: { applicationId: 'application-1' },
  };
  const workspaceLimit: FlatStockLimit = {
    id: 'workspace-limit',
    resourceType: UsageResourceType.STORAGE,
    operationType: UsageOperationType.STORAGE_FILE,
    spenderType: 'workspace',
    spenderId: '',
    limitKind: 'stock',
    periodCount: 1,
    periodUnit: 'lifetime',
    meter: 'bytes',
    limitValue: 500,
    burstValue: null,
  };

  const buildService = async (
    limits: FlatStockLimit[] = [
      workspaceLimit,
      {
        ...workspaceLimit,
        id: 'application-limit',
        spenderType: 'application',
        spenderId: 'application-1',
      },
    ],
  ) => {
    const balances = new Map<string, number>();
    const mdel = jest.fn(async (keys: string[]) => {
      keys.forEach((key) => balances.delete(key));
    });
    const incrementCounterBy = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        UsageLimitStockService,
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: {
            mget: async (keys: string[]) =>
              keys.map((key) => balances.get(key) ?? null),
            mset: async (entries: { key: string; value: number }[]) => {
              entries.forEach(({ key, value }) => balances.set(key, value));
            },
            mdel,
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: async () => ({
              usageLimits: {
                byResourceType: {
                  [UsageResourceType.STORAGE]: limits,
                },
              },
            }),
          },
        },
        {
          provide: CacheLockService,
          useValue: {
            withLock: (callback: () => Promise<unknown>) => callback(),
          },
        },
        {
          provide: UsageLimitEntitlementService,
          useValue: {
            findEnforceableLimits: async ({
              limits,
            }: {
              limits: FlatStockLimit[];
            }) => limits,
          },
        },
        { provide: MetricsService, useValue: { incrementCounterBy } },
        { provide: TwentyConfigService, useValue: { get: () => 1_000 } },
      ],
    }).compile();

    return {
      service: module.get(UsageLimitStockService),
      balances,
      mdel,
      incrementCounterBy,
    };
  };

  it('drops workspace and application balances and recomputes usage on the next check', async () => {
    const { service, balances } = await buildService();
    const computeUsedStock = jest
      .fn()
      .mockResolvedValue({ bytes: 100, quantity: 1 });
    const request = { ...scope, cost: { bytes: 1 }, computeUsedStock };

    await service.assertStockAvailable(request);
    expect(balances.size).toBe(2);
    balances.set('unrelated-counter', 123);

    await service.invalidateStock(scope);

    expect([...balances.entries()]).toEqual([['unrelated-counter', 123]]);
    computeUsedStock.mockResolvedValue({ bytes: 20, quantity: 1 });
    await service.assertStockAvailable(request);

    expect([...balances.values()].sort((left, right) => left - right)).toEqual([
      123, 480, 480,
    ]);
  });

  it('invalidates the default balance after rollback when no override exists', async () => {
    const { service, balances } = await buildService([]);
    const computeUsedStock = jest
      .fn()
      .mockResolvedValue({ bytes: 100, quantity: 1 });
    const request = { ...scope, cost: { bytes: 1 }, computeUsedStock };

    await service.assertStockAvailable(request);
    expect([...balances.values()]).toEqual([900]);

    await service.invalidateStock(scope);
    expect(balances.size).toBe(0);

    computeUsedStock.mockResolvedValue({ bytes: 20, quantity: 1 });
    await service.assertStockAvailable(request);
    expect([...balances.values()]).toEqual([980]);
  });

  it('recomputes the default after removing a workspace override', async () => {
    const limits: FlatStockLimit[] = [];
    const { service, balances } = await buildService(limits);
    const computeUsedStock = jest
      .fn()
      .mockResolvedValue({ bytes: 100, quantity: 1 });
    const request = { ...scope, cost: { bytes: 1 }, computeUsedStock };
    const counterScope = {
      workspaceId: scope.workspaceId,
      resourceType: scope.resourceType,
      spenderType: workspaceLimit.spenderType,
      spenderId: workspaceLimit.spenderId,
    };

    await service.assertStockAvailable(request);
    expect([...balances.values()]).toEqual([900]);

    limits.push(workspaceLimit);
    await service.dropStockCounters(counterScope);
    await service.assertStockAvailable(request);
    expect([...balances.values()]).toEqual([400]);

    computeUsedStock.mockResolvedValue({ bytes: 300, quantity: 2 });
    limits.splice(0);
    await service.dropStockCounters(counterScope);
    await service.assertStockAvailable(request);
    expect([...balances.values()]).toEqual([700]);
  });

  it('records a cache failure without throwing over the transaction failure', async () => {
    const { service, mdel, incrementCounterBy } = await buildService();
    const logger = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    mdel.mockRejectedValue(new Error('Redis unavailable'));

    try {
      await expect(service.invalidateStock(scope)).resolves.toBeUndefined();
      expect(incrementCounterBy).toHaveBeenCalledTimes(1);
    } finally {
      logger.mockRestore();
    }
  });
});
