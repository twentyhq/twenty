import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsagePeriodService } from 'src/engine/core-modules/usage/services/usage-period.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const BILLING_PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2100-09-01T00:00:00.000Z'),
};

const WEEK_PERIOD = {
  periodStart: new Date('2026-08-24T00:00:00.000Z'),
  periodEnd: new Date('2100-08-31T00:00:00.000Z'),
};

const buildLimit = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  periodCount: 1,
  periodUnit: 'billingPeriod',
  meter: 'creditsUsedMicro',
  limitValueType: 'absolute',
  limitValue: 1_000,
  burstValue: null,
  ...overrides,
});

describe('UsageLimitQuotaService', () => {
  let service: UsageLimitQuotaService;

  const cacheStorage = {
    mget: jest.fn().mockResolvedValue([]),
    mset: jest.fn().mockResolvedValue(undefined),
    runScript: jest.fn().mockResolvedValue([]),
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

  const billingService = {
    isBillingEnabled: jest.fn().mockReturnValue(false),
  };

  const billingUsageService = {
    hasAvailableCredits: jest.fn().mockResolvedValue(true),
    getCurrentAllowanceMicro: jest.fn().mockResolvedValue(null),
    decrementAvailableCreditsInCache: jest.fn().mockResolvedValue(null),
  };

  const setLimits = (limits: FlatUsageLimit[]) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: {
        byResourceType: { [UsageResourceType.AI]: limits },
      },
    });
  };

  const assertCanConsume = () =>
    service.assertCanConsume({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
    });

  const settle = (creditsUsedMicro: number, quantity = 0) =>
    service.settle({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
      cost: { creditsUsedMicro, quantity },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    cacheStorage.mget.mockResolvedValue([]);
    cacheStorage.runScript.mockResolvedValue([]);
    clickHouseService.selectOrThrow.mockResolvedValue([]);
    usagePeriodService.getCurrentPeriod.mockImplementation(
      async ({ periodUnit = 'billingPeriod' }: { periodUnit?: string }) =>
        periodUnit === 'week' ? WEEK_PERIOD : BILLING_PERIOD,
    );
    billingService.isBillingEnabled.mockReturnValue(false);
    billingUsageService.hasAvailableCredits.mockResolvedValue(true);
    billingUsageService.getCurrentAllowanceMicro.mockResolvedValue(null);
    billingUsageService.decrementAvailableCreditsInCache.mockResolvedValue(
      null,
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
        { provide: BillingService, useValue: billingService },
        { provide: BillingUsageService, useValue: billingUsageService },
      ],
    }).compile();

    service = module.get<UsageLimitQuotaService>(UsageLimitQuotaService);
  });

  it('admits when no limit exists and the pool is unlimited', async () => {
    await expect(assertCanConsume()).resolves.toBeUndefined();
    expect(cacheStorage.mget).not.toHaveBeenCalled();
  });

  it('admits on a warm counter with budget left', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([250]);

    await expect(assertCanConsume()).resolves.toBeUndefined();
    expect(clickHouseService.selectOrThrow).not.toHaveBeenCalled();
  });

  it('denies on an exhausted warm counter', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([0]);

    await expect(assertCanConsume()).rejects.toMatchObject({
      code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      exhaustedScope: expect.objectContaining({
        spenderType: 'workspace',
        limitKind: 'quota',
        isDefault: false,
      }),
    });
  });

  it('warms a cold billing-period counter by stamped period and denies when spent', async () => {
    billingService.isBillingEnabled.mockReturnValue(true);
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: {
        byResourceType: {
          [UsageResourceType.AI]: [buildLimit({ limitValue: 100 })],
        },
      },
      currentBillingSubscription: {
        currentPeriodStart: BILLING_PERIOD.periodStart,
        currentPeriodEnd: BILLING_PERIOD.periodEnd,
      },
    });
    cacheStorage.mget.mockResolvedValue([undefined]);
    clickHouseService.selectOrThrow.mockResolvedValue([
      {
        operationType: UsageOperationType.AI_CHAT_TOKEN,
        userWorkspaceId: 'user-1',
        apiKeyId: '',
        applicationId: '',
        creditsUsedMicro: '150',
        quantity: '10',
      },
    ]);

    await expect(assertCanConsume()).rejects.toThrow(UsageLimitException);
    expect(clickHouseService.selectOrThrow).toHaveBeenCalledWith(
      expect.stringContaining('periodStart = {periodStart:DateTime64(3)}'),
      expect.anything(),
    );
    expect(cacheStorage.mset).toHaveBeenCalledWith([
      expect.objectContaining({ value: -50 }),
    ]);
  });

  it('warms a billing-period counter by timestamp range when no subscription anchors it', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([undefined]);

    await expect(assertCanConsume()).resolves.toBeUndefined();
    expect(clickHouseService.selectOrThrow).toHaveBeenCalledWith(
      expect.stringContaining('timestamp >= {periodStart:DateTime64(3)}'),
      expect.anything(),
    );
  });

  it('warms a calendar counter by timestamp range', async () => {
    setLimits([buildLimit({ periodUnit: 'week' })]);
    cacheStorage.mget.mockResolvedValue([undefined]);

    await expect(assertCanConsume()).resolves.toBeUndefined();
    expect(clickHouseService.selectOrThrow).toHaveBeenCalledWith(
      expect.stringContaining('timestamp >= {periodStart:DateTime64(3)}'),
      expect.anything(),
    );
  });

  it('runs one warm query per distinct period', async () => {
    setLimits([
      buildLimit({ id: 'monthly' }),
      buildLimit({ id: 'weekly', periodUnit: 'week' }),
    ]);
    cacheStorage.mget.mockResolvedValue([undefined, undefined]);

    await assertCanConsume();

    expect(clickHouseService.selectOrThrow).toHaveBeenCalledTimes(2);
  });

  it('names the narrowest exhausted scope', async () => {
    setLimits([
      buildLimit({}),
      buildLimit({
        id: 'limit-2',
        spenderType: 'userWorkspace',
        spenderId: 'user-1',
      }),
    ]);
    cacheStorage.mget.mockResolvedValue([0, 0]);

    await expect(assertCanConsume()).rejects.toMatchObject({
      exhaustedScope: expect.objectContaining({
        spenderType: 'userWorkspace',
        spenderId: 'user-1',
      }),
    });
  });

  it('denies when the pool is exhausted with no limit configured', async () => {
    billingService.isBillingEnabled.mockReturnValue(true);
    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    await expect(assertCanConsume()).rejects.toMatchObject({
      exhaustedScope: expect.objectContaining({
        spenderType: 'workspace',
        isDefault: true,
      }),
    });
  });

  it('admits when the counters cannot be read', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockRejectedValue(new Error('Socket closed'));

    await expect(assertCanConsume()).resolves.toBeUndefined();
  });

  it('admits when the warm query fails instead of granting a fresh budget', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.mget.mockResolvedValue([undefined]);
    clickHouseService.selectOrThrow.mockRejectedValue(
      new Error('clickhouse unreachable'),
    );

    await expect(assertCanConsume()).resolves.toBeUndefined();
    expect(cacheStorage.mset).not.toHaveBeenCalled();
  });

  it('debits each counter in its own meter on settle', async () => {
    setLimits([
      buildLimit({ id: 'credits' }),
      buildLimit({ id: 'tokens', meter: 'quantity' }),
    ]);
    cacheStorage.runScript.mockResolvedValue([1, 500, 1, 900]);

    const { exhausted } = await settle(50, 7);

    expect(cacheStorage.runScript).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['[50,7]'] }),
    );
    expect(exhausted).toBeNull();
  });

  it('settles only warm counters and reports the exhausted one', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.runScript.mockResolvedValue([1, -10]);

    const { exhausted } = await settle(50);

    expect(exhausted).toMatchObject({ spenderType: 'workspace' });
  });

  it('reports nothing when a cold counter is skipped by settle', async () => {
    setLimits([buildLimit({})]);
    cacheStorage.runScript.mockResolvedValue([0, 0]);

    const { exhausted } = await settle(50);

    expect(exhausted).toBeNull();
  });

  it('consumes the pool on settle and reports its exhaustion', async () => {
    billingService.isBillingEnabled.mockReturnValue(true);
    billingUsageService.decrementAvailableCreditsInCache.mockResolvedValue(-5);

    const { exhausted } = await settle(50);

    expect(
      billingUsageService.decrementAvailableCreditsInCache,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      usedCredits: 50,
    });
    expect(exhausted).toMatchObject({
      spenderType: 'workspace',
      isDefault: true,
    });
  });
});
