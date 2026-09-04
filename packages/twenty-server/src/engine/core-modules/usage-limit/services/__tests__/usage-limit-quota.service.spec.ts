import { DiscoveryService } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { buildAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-allowance-counter-key.util';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { buildQuotaWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-warm-lock-key.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MONTH_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2100-09-01T00:00:00.000Z'),
};

const WEEK_PERIOD = {
  periodStart: new Date('2026-08-24T00:00:00.000Z'),
  periodEnd: new Date('2100-08-31T00:00:00.000Z'),
};

const ALLOWANCE_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2100-09-15T09:00:00.000Z'),
};

class TestCreditAllowanceProvider extends CreditAllowanceProvider {
  isCreditAllowanceEnabled = jest.fn().mockResolvedValue(true);
  getCreditAllowancePeriod = jest.fn().mockResolvedValue(null);
  getCreditAllowance = jest.fn().mockResolvedValue(null);
}

const buildLimitCounterScope = (
  overrides: Partial<UsageLimitCounterScope> = {},
): UsageLimitCounterScope => ({
  workspaceId: 'workspace-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  ...overrides,
});

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
  limitValue: 1_000,
  burstValue: null,
  ...overrides,
});

describe('UsageLimitQuotaService', () => {
  let service: UsageLimitQuotaService;
  let creditAllowanceProvider: TestCreditAllowanceProvider;

  const cacheStorage = {
    mget: jest.fn().mockResolvedValue([]),
    mset: jest.fn().mockResolvedValue(undefined),
    runScript: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(undefined),
  };

  const workspaceCacheService = {
    getOrRecompute: jest
      .fn()
      .mockResolvedValue({ usageLimits: { byResourceType: {} } }),
  };

  const cacheLockService = {
    withLock: jest.fn((fn: () => Promise<unknown>) => fn()),
  };

  const clickHouseService = {
    selectOrThrow: jest.fn().mockResolvedValue([]),
  };

  const usagePeriodService = {
    getCurrentPeriod: jest.fn(),
  };

  const setLimits = (limits: FlatUsageLimit[]) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: {
        byResourceType: { [UsageResourceType.AI]: limits },
      },
    });
  };

  const setAllowance = (allowanceMicro: number | null) => {
    creditAllowanceProvider.getCreditAllowancePeriod.mockResolvedValue(
      ALLOWANCE_PERIOD,
    );
    creditAllowanceProvider.getCreditAllowance.mockResolvedValue(
      allowanceMicro === null ? null : { ...ALLOWANCE_PERIOD, allowanceMicro },
    );
  };

  const assertQuotaNotExhausted = () =>
    service.assertQuotaNotExhausted({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
    });

  const consumeQuota = (creditsUsedMicro: number, quantity = 0) =>
    service.consumeQuota({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
      cost: { creditsUsedMicro, quantity },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    creditAllowanceProvider = new TestCreditAllowanceProvider();
    cacheStorage.mget.mockResolvedValue([]);
    cacheStorage.runScript.mockResolvedValue([]);
    clickHouseService.selectOrThrow.mockResolvedValue([]);
    usagePeriodService.getCurrentPeriod.mockImplementation(
      (periodUnit: string) =>
        periodUnit === 'week' ? WEEK_PERIOD : MONTH_PERIOD,
    );
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: { byResourceType: {} },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitQuotaService,
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: cacheStorage,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: CacheLockService, useValue: cacheLockService },
        { provide: ClickHouseService, useValue: clickHouseService },
        { provide: UsagePeriodService, useValue: usagePeriodService },
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: () => [{ instance: creditAllowanceProvider }],
          },
        },
      ],
    }).compile();

    service = module.get<UsageLimitQuotaService>(UsageLimitQuotaService);
    service.onModuleInit();
  });

  it('admits on a warm counter with budget left', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([250]);

    await expect(assertQuotaNotExhausted()).resolves.toBeUndefined();
    expect(clickHouseService.selectOrThrow).not.toHaveBeenCalled();
  });

  it('denies on an exhausted warm counter', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([0]);

    await expect(assertQuotaNotExhausted()).rejects.toMatchObject({
      code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      exhaustedScope: expect.objectContaining({
        spenderType: 'workspace',
        limitKind: 'quota',
        exhaustedKind: 'limit',
      }),
    });
  });

  it('warms limit counters over UTC day buckets', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([undefined]);

    await expect(assertQuotaNotExhausted()).resolves.toBeUndefined();
    expect(clickHouseService.selectOrThrow).toHaveBeenCalledWith(
      expect.stringContaining(
        "toStartOfDay(timestamp, 'UTC') >= {periodStart:DateTime64(3)}",
      ),
      expect.anything(),
    );
  });

  it('runs one warm query per distinct period', async () => {
    setLimits([
      buildLimit({ id: 'monthly' }),
      buildLimit({ id: 'weekly', periodUnit: 'week' }),
    ]);
    cacheStorage.mget.mockResolvedValue([undefined, undefined]);

    await assertQuotaNotExhausted();

    expect(clickHouseService.selectOrThrow).toHaveBeenCalledTimes(2);
  });

  it('warms a cold allowance counter from the live allowance minus the stamped consumption', async () => {
    setAllowance(100);
    cacheStorage.mget.mockResolvedValue([undefined]);
    clickHouseService.selectOrThrow.mockResolvedValue([{ total: '150' }]);

    await expect(assertQuotaNotExhausted()).rejects.toThrow(
      UsageLimitException,
    );
    expect(clickHouseService.selectOrThrow).toHaveBeenCalledWith(
      expect.stringContaining('periodStart = {periodStart:DateTime64(3)}'),
      expect.anything(),
    );
    expect(cacheStorage.mset).toHaveBeenCalledWith([
      expect.objectContaining({ value: -50 }),
    ]);
  });

  it('scopes a spent allowance counter over the live allowance', async () => {
    setAllowance(2_000_000);
    cacheStorage.mget.mockResolvedValue([0]);

    await expect(assertQuotaNotExhausted()).rejects.toMatchObject({
      exhaustedScope: expect.objectContaining({
        exhaustedKind: 'allowance',
        limitValue: 2_000_000,
      }),
    });
  });

  it('reports an exhausted limit over the exhausted allowance', async () => {
    setLimits([buildLimit({})]);
    setAllowance(2_000_000);
    cacheStorage.mget.mockResolvedValue([0, 0]);

    await expect(assertQuotaNotExhausted()).rejects.toMatchObject({
      exhaustedScope: expect.objectContaining({ exhaustedKind: 'limit' }),
    });
  });

  it('builds no allowance counter when the provider reports it disabled', async () => {
    setLimits([buildLimit({})]);
    setAllowance(2_000_000);
    creditAllowanceProvider.isCreditAllowanceEnabled.mockResolvedValue(false);
    cacheStorage.mget.mockResolvedValue([0]);

    await expect(assertQuotaNotExhausted()).rejects.toMatchObject({
      exhaustedScope: expect.objectContaining({ exhaustedKind: 'limit' }),
    });
    expect(cacheStorage.mget).toHaveBeenCalledWith([
      expect.not.stringContaining(':allowance:'),
    ]);
    expect(
      creditAllowanceProvider.getCreditAllowancePeriod,
    ).not.toHaveBeenCalled();
  });

  it('skips warming an allowance whose period rolled over since the read', async () => {
    creditAllowanceProvider.getCreditAllowancePeriod.mockResolvedValue(
      ALLOWANCE_PERIOD,
    );
    creditAllowanceProvider.getCreditAllowance.mockResolvedValue({
      allowanceMicro: 100,
      periodStart: new Date('2026-09-15T09:00:00.000Z'),
      periodEnd: new Date('2100-10-15T09:00:00.000Z'),
    });
    cacheStorage.mget.mockResolvedValue([undefined]);

    await expect(assertQuotaNotExhausted()).resolves.toBeUndefined();
    expect(cacheStorage.mset).toHaveBeenCalledWith([]);
  });

  it('admits when the counters cannot be read', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockRejectedValue(new Error('Socket closed'));

    await expect(assertQuotaNotExhausted()).resolves.toBeUndefined();
  });

  it('admits when the warm query fails instead of granting a fresh budget', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([undefined]);
    clickHouseService.selectOrThrow.mockRejectedValue(
      new Error('clickhouse unreachable'),
    );

    await expect(assertQuotaNotExhausted()).resolves.toBeUndefined();
    expect(cacheStorage.mset).not.toHaveBeenCalled();
  });

  it('debits each counter in its own meter on consume', async () => {
    setLimits([
      buildLimit({ id: 'credits' }),
      buildLimit({ id: 'tokens', meter: 'quantity' }),
    ]);
    cacheStorage.runScript.mockResolvedValue([1, 500, 1, 900]);

    const { exhausted } = await consumeQuota(50, 7);

    expect(cacheStorage.runScript).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['[50,7]'] }),
    );
    expect(exhausted).toBeNull();
  });

  it('consumes an invalid cost as zero instead of crediting the counter', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.runScript.mockResolvedValue([1, 950]);

    await consumeQuota(-50, Number.NaN);

    expect(cacheStorage.runScript).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['[0]'] }),
    );
  });

  it('debits the allowance counter with the credit cost on consume', async () => {
    setLimits([buildLimit({ meter: 'quantity' })]);
    setAllowance(2_000_000);
    cacheStorage.runScript.mockResolvedValue([1, 500, 1, -5]);

    const { exhausted } = await consumeQuota(50, 7);

    expect(cacheStorage.runScript).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['[7,50]'] }),
    );
    expect(exhausted).toMatchObject({ exhaustedKind: 'allowance' });
  });

  it('warms a cold counter before consuming it', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([undefined]);
    cacheStorage.runScript.mockResolvedValue([1, 950]);

    const { exhausted } = await consumeQuota(50);

    expect(cacheStorage.mset).toHaveBeenCalledWith([
      expect.objectContaining({ value: 1_000 }),
    ]);
    expect(cacheStorage.runScript).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['[50]'] }),
    );
    expect(exhausted).toBeNull();
  });

  describe('dropAllowanceCounter', () => {
    it('drops the counter keyed by the current period', async () => {
      setAllowance(2_000_000);

      await service.dropAllowanceCounter('workspace-1');

      expect(cacheStorage.del).toHaveBeenCalledWith(
        buildAllowanceCounterKey({
          workspaceId: 'workspace-1',
          periodStart: ALLOWANCE_PERIOD.periodStart,
        }),
      );
    });

    it('does nothing when no allowance exists', async () => {
      await service.dropAllowanceCounter('workspace-1');

      expect(cacheStorage.del).not.toHaveBeenCalled();
    });
  });

  describe('dropLimitCounter', () => {
    it('drops the counter keyed by the current period under the warm lock', async () => {
      await service.dropLimitCounter(buildLimitCounterScope());

      expect(cacheLockService.withLock).toHaveBeenCalledWith(
        expect.any(Function),
        buildQuotaWarmLockKey('workspace-1'),
        expect.anything(),
      );
      expect(cacheStorage.del).toHaveBeenCalledWith(
        buildQuotaCounterKey({
          workspaceId: 'workspace-1',
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          spenderType: 'workspace',
          spenderId: '',
          meter: 'creditsUsedMicro',
          periodUnit: 'month',
          periodStart: MONTH_PERIOD.periodStart,
        }),
      );
    });

    it('ignores a speed limit', async () => {
      await service.dropLimitCounter(
        buildLimitCounterScope({ limitKind: 'speed', periodUnit: 'second' }),
      );

      expect(cacheStorage.del).not.toHaveBeenCalled();
    });

    it('dels without the lock when acquiring it times out', async () => {
      cacheLockService.withLock.mockRejectedValueOnce(
        new CacheLockException(
          'timed out',
          CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT,
        ),
      );

      await service.dropLimitCounter(buildLimitCounterScope());

      expect(cacheStorage.del).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllowanceRemainingMicro', () => {
    it('reads the warm allowance counter', async () => {
      setAllowance(2_000_000);
      cacheStorage.mget.mockResolvedValue([1_500]);

      await expect(
        service.getAllowanceRemainingMicro('workspace-1'),
      ).resolves.toBe(1_500);
    });

    it('answers null when no allowance exists', async () => {
      await expect(
        service.getAllowanceRemainingMicro('workspace-1'),
      ).resolves.toBeNull();
      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });
  });
});
