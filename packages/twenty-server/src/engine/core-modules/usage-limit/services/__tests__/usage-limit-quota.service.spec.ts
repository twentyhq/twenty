import { DiscoveryService } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CreditAllowanceProvider } from 'src/engine/core-modules/usage-limit/interfaces/credit-allowance-provider.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type UsageLimitCounterScope } from 'src/engine/core-modules/usage-limit/types/usage-limit-counter-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsagePeriodService } from 'src/engine/core-modules/usage/services/usage-period.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Happy paths run against real Redis and ClickHouse in the quota-enforcement
// and billing-credit-allowance integration specs; this spec only injects the
// infrastructure failures those cannot stage.
const MONTH_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2100-09-01T00:00:00.000Z'),
};

const ALLOWANCE_PERIOD = {
  periodStart: new Date('2026-08-15T09:00:00.000Z'),
  periodEnd: new Date('2100-09-15T09:00:00.000Z'),
};

class TestCreditAllowanceProvider extends CreditAllowanceProvider {
  getCreditAllowancePeriod = jest.fn().mockResolvedValue(null);
  getCreditAllowance = jest.fn().mockResolvedValue(null);
}

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

const buildLimitCounterScope = (): UsageLimitCounterScope => ({
  workspaceId: 'workspace-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodUnit: 'month',
  meter: 'creditsUsedMicro',
});

describe('UsageLimitQuotaService when infrastructure degrades', () => {
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

  const assertQuotaNotExhausted = () =>
    service.assertQuotaNotExhausted({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    creditAllowanceProvider = new TestCreditAllowanceProvider();
    cacheStorage.mget.mockResolvedValue([]);
    clickHouseService.selectOrThrow.mockResolvedValue([]);
    usagePeriodService.getCurrentPeriod.mockReturnValue(MONTH_PERIOD);
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

  it('drops a counter without the lock when acquiring it times out', async () => {
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
