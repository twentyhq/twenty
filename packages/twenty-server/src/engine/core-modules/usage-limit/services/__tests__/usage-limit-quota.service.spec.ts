import { Test, type TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheStorageException,
  CacheStorageExceptionCode,
} from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageAllowanceResolverRegistry } from 'src/engine/core-modules/usage-limit/services/usage-allowance-resolver-registry.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsagePeriodService } from 'src/engine/core-modules/usage/services/usage-period.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const PERIOD = {
  periodStart: new Date('2026-08-01T00:00:00.000Z'),
  periodEnd: new Date('2026-09-01T00:00:00.000Z'),
};

const buildRule = (overrides: Partial<FlatUsageLimit>): FlatUsageLimit => ({
  id: 'rule-id',
  resourceType: UsageResourceType.AI,
  operationType: '',
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'quota',
  windowSeconds: 0,
  limitValueType: 'absolute',
  limitValue: 1_000,
  burstValue: null,
  ...overrides,
});

describe('UsageLimitQuotaService', () => {
  let service: UsageLimitQuotaService;

  const cacheStorage = {
    mget: jest.fn(),
    set: jest.fn(),
    runScript: jest.fn(),
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };

  const featureFlagService = {
    isFeatureEnabled: jest.fn().mockResolvedValue(true),
  };

  const usagePeriodService = {
    getCurrentPeriod: jest.fn().mockResolvedValue(PERIOD),
  };

  const usageAllowanceResolverRegistry = {
    resolveUsageAllowance: jest.fn().mockResolvedValue(null),
  };

  const cacheLockService = {
    withLock: jest.fn((fn: () => Promise<unknown>) => fn()),
  };

  const clickHouseService = {
    selectOrThrow: jest.fn().mockResolvedValue([]),
  };

  const setRules = (rules: FlatUsageLimit[]) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimitRules: {
        byResourceType: { [UsageResourceType.AI]: rules },
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

  const settle = (cost = 100) =>
    service.settle({
      workspaceId: 'workspace-1',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId: 'user-1' },
      cost,
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    featureFlagService.isFeatureEnabled.mockResolvedValue(true);
    usagePeriodService.getCurrentPeriod.mockResolvedValue(PERIOD);
    usageAllowanceResolverRegistry.resolveUsageAllowance.mockResolvedValue(
      null,
    );
    cacheLockService.withLock.mockImplementation((fn: () => Promise<unknown>) =>
      fn(),
    );
    clickHouseService.selectOrThrow.mockResolvedValue([]);
    setRules([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitQuotaService,
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: cacheStorage,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: FeatureFlagService, useValue: featureFlagService },
        { provide: UsagePeriodService, useValue: usagePeriodService },
        {
          provide: UsageAllowanceResolverRegistry,
          useValue: usageAllowanceResolverRegistry,
        },
        { provide: CacheLockService, useValue: cacheLockService },
        { provide: ClickHouseService, useValue: clickHouseService },
      ],
    }).compile();

    service = module.get(UsageLimitQuotaService);
  });

  describe('assertCanConsume', () => {
    it('admits without touching Redis when the flag is off', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);
      setRules([buildRule({ limitValue: 1 })]);

      await expect(assertCanConsume()).resolves.toBeUndefined();
      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('admits when no rule and no allowance apply', async () => {
      await expect(assertCanConsume()).resolves.toBeUndefined();
      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('admits on a warm counter with budget left', async () => {
      setRules([buildRule({})]);
      cacheStorage.mget.mockResolvedValue([42]);

      await expect(assertCanConsume()).resolves.toBeUndefined();
    });

    it('denies on a warm counter with nothing left', async () => {
      setRules([buildRule({})]);
      cacheStorage.mget.mockResolvedValue([0]);

      await expect(assertCanConsume()).rejects.toThrow(
        expect.objectContaining({
          code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        }),
      );
    });

    it('names the narrowest exhausted scope and the period end', async () => {
      setRules([
        buildRule({ id: 'workspace-wide' }),
        buildRule({
          id: 'member',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
          limitValue: 100,
        }),
      ]);
      // Narrowest first: the member counter, then the workspace one.
      cacheStorage.mget.mockResolvedValue([-5, 900]);

      let thrown: UsageLimitException | undefined;

      try {
        await assertCanConsume();
      } catch (error) {
        thrown = error as UsageLimitException;
      }

      expect(thrown?.exhaustedScope).toEqual(
        expect.objectContaining({
          limitKind: 'quota',
          spenderType: 'userWorkspace',
          spenderId: 'user-1',
          remaining: 0,
          periodEnd: PERIOD.periodEnd,
        }),
      );
    });

    it('warms a cold counter from the period usage and denies when spent', async () => {
      setRules([buildRule({ limitValue: 1_000 })]);
      cacheStorage.mget.mockResolvedValue([undefined]);
      clickHouseService.selectOrThrow.mockResolvedValue([
        {
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          userWorkspaceId: 'user-1',
          total: '700',
        },
        {
          operationType: UsageOperationType.WEB_SEARCH,
          userWorkspaceId: 'user-2',
          total: '400',
        },
      ]);

      await expect(assertCanConsume()).rejects.toThrow(
        expect.objectContaining({
          code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        }),
      );

      expect(clickHouseService.selectOrThrow).toHaveBeenCalledTimes(1);
      expect(cacheStorage.set).toHaveBeenCalledWith(
        expect.stringContaining(':quota:AI:ALL:workspace:-:'),
        -100,
        expect.any(Number),
      );
    });

    it('admits and leaves the counter cold when the warm read fails', async () => {
      setRules([buildRule({ limitValue: 1 })]);
      cacheStorage.mget.mockResolvedValue([undefined]);
      clickHouseService.selectOrThrow.mockRejectedValue(
        new Error('clickhouse unreachable'),
      );

      await expect(assertCanConsume()).resolves.toBeUndefined();
      expect(cacheStorage.set).not.toHaveBeenCalled();
    });

    it('admits when Redis is down', async () => {
      setRules([buildRule({ limitValue: 1 })]);
      cacheStorage.mget.mockRejectedValue(
        new CacheStorageException(
          'down',
          CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
        ),
      );

      await expect(assertCanConsume()).resolves.toBeUndefined();
    });

    it('sizes the fallback counter from the allowance', async () => {
      usageAllowanceResolverRegistry.resolveUsageAllowance.mockResolvedValue(
        500,
      );
      cacheStorage.mget.mockResolvedValue([undefined]);
      clickHouseService.selectOrThrow.mockResolvedValue([
        { operationType: 'CODE_EXECUTION', userWorkspaceId: '', total: 600 },
      ]);

      await expect(assertCanConsume()).rejects.toThrow(
        expect.objectContaining({
          code: UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        }),
      );

      expect(cacheStorage.set).toHaveBeenCalledWith(
        expect.stringContaining(':quota:ALL:ALL:workspace:-:'),
        -100,
        expect.any(Number),
      );
    });
  });

  describe('settle', () => {
    it('reports the scope whose budget the cost exhausted', async () => {
      setRules([buildRule({})]);
      cacheStorage.runScript.mockResolvedValue([-20]);

      const { exhausted } = await settle();

      expect(exhausted).toEqual(
        expect.objectContaining({
          limitKind: 'quota',
          spenderType: 'workspace',
          remaining: 0,
        }),
      );
    });

    it('reports nothing while budget remains', async () => {
      setRules([buildRule({})]);
      cacheStorage.runScript.mockResolvedValue([37]);

      await expect(settle()).resolves.toEqual({ exhausted: null });
    });

    it('skips cold counters instead of creating them', async () => {
      setRules([buildRule({})]);
      cacheStorage.runScript.mockResolvedValue([null]);

      await expect(settle()).resolves.toEqual({ exhausted: null });
    });

    it('fails open when Redis is down', async () => {
      setRules([buildRule({})]);
      cacheStorage.runScript.mockRejectedValue(
        new CacheStorageException(
          'down',
          CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
        ),
      );

      await expect(settle()).resolves.toEqual({ exhausted: null });
    });

    it('does nothing for a zero cost', async () => {
      setRules([buildRule({})]);

      await expect(settle(0)).resolves.toEqual({ exhausted: null });
      expect(cacheStorage.runScript).not.toHaveBeenCalled();
    });
  });
});
