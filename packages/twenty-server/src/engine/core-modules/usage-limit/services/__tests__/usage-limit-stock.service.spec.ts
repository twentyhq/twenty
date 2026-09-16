import { Test, type TestingModule } from '@nestjs/testing';

import { DiscoveryService } from '@nestjs/core';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RELEASE_STOCK_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/release-stock-counters-script.constant';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsageLimitStockService } from 'src/engine/core-modules/usage-limit/services/usage-limit-stock.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-1';
const TTL = 2 * 24 * 60 * 60 * 1000;

const APPLICATION_ID = 'application-1';

const BYTES_KEY = buildStockCounterKey({
  workspaceId: WORKSPACE_ID,
  resourceType: UsageResourceType.STORAGE,
  spenderType: 'workspace',
  spenderId: '',
  meter: 'bytes',
});

const APPLICATION_BYTES_KEY = buildStockCounterKey({
  workspaceId: WORKSPACE_ID,
  resourceType: UsageResourceType.STORAGE,
  spenderType: 'application',
  spenderId: APPLICATION_ID,
  meter: 'bytes',
});

const buildLimit = (
  overrides: Partial<FlatUsageLimit> = {},
): FlatUsageLimit => ({
  id: 'limit-1',
  resourceType: UsageResourceType.STORAGE,
  operationType: UsageOperationType.STORAGE_FILE,
  spenderType: 'workspace',
  spenderId: '',
  limitKind: 'stock',
  periodCount: 1,
  periodUnit: 'lifetime',
  meter: 'bytes',
  limitValue: 1_000,
  burstValue: null,
  ...overrides,
});

class TestUsageLimitEntitlementProvider extends UsageLimitEntitlementProvider {
  hasIntraWorkspaceLimitEntitlement = jest.fn().mockResolvedValue(true);
}

describe('UsageLimitStockService', () => {
  let service: UsageLimitStockService;
  let entitlementProvider: TestUsageLimitEntitlementProvider;

  const cacheStorage = {
    mget: jest.fn(),
    mset: jest.fn().mockResolvedValue(undefined),
    mdel: jest.fn().mockResolvedValue(undefined),
    runScript: jest.fn().mockResolvedValue(1),
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };

  const cacheLockService = {
    withLock: jest.fn((fn: () => Promise<unknown>) => fn()),
  };

  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const fileRepository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  const metricsService = { incrementCounterBy: jest.fn() };

  const setLimits = (limits: FlatUsageLimit[]) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: {
        byResourceType: { [UsageResourceType.STORAGE]: limits },
      },
    });
  };

  const setHeld = ({ bytes, quantity }: { bytes: number; quantity: number }) =>
    queryBuilder.getRawOne.mockResolvedValue({
      bytes: String(bytes),
      quantity: String(quantity),
    });

  const assertStockAvailable = (bytes: number, spenders = {}) =>
    service.assertStockAvailable({
      workspaceId: WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenders,
      cost: { bytes },
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    entitlementProvider = new TestUsageLimitEntitlementProvider();
    entitlementProvider.hasIntraWorkspaceLimitEntitlement.mockResolvedValue(
      true,
    );
    cacheLockService.withLock.mockImplementation((fn: () => Promise<unknown>) =>
      fn(),
    );
    cacheStorage.mget.mockResolvedValue([undefined]);
    cacheStorage.runScript.mockResolvedValue(1);
    setLimits([buildLimit()]);
    setHeld({ bytes: 0, quantity: 0 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitStockService,
        UsageLimitEntitlementService,
        {
          provide: DiscoveryService,
          useValue: { getProviders: () => [{ instance: entitlementProvider }] },
        },
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: cacheStorage,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(FileEntity),
          useValue: fileRepository,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: CacheLockService, useValue: cacheLockService },
        { provide: MetricsService, useValue: metricsService },
      ],
    }).compile();

    service = module.get<UsageLimitStockService>(UsageLimitStockService);
    module.get(UsageLimitEntitlementService).onModuleInit();
  });

  describe('assertStockAvailable', () => {
    it('warms a cold counter to the remainder and admits what fits', async () => {
      setHeld({ bytes: 400, quantity: 2 });

      await expect(assertStockAvailable(600)).resolves.toBeUndefined();

      expect(cacheStorage.mset).toHaveBeenCalledWith([
        { key: BYTES_KEY, value: 600, ttl: TTL },
      ]);
    });

    it('admits a cost that exactly consumes the remainder', async () => {
      cacheStorage.mget.mockResolvedValue([250]);

      await expect(assertStockAvailable(250)).resolves.toBeUndefined();
    });

    it('refuses a cost larger than the remainder', async () => {
      cacheStorage.mget.mockResolvedValue([250]);

      await expect(assertStockAvailable(251)).rejects.toMatchObject({
        code: UsageLimitExceptionCode.STOCK_EXHAUSTED,
        exhaustedScope: {
          limitKind: 'stock',
          limitValue: 1_000,
          remaining: 250,
          periodUnit: null,
          retryAfterMs: 0,
        },
      });
    });

    it('enforces a lowered limit once the counter has lapsed', async () => {
      setHeld({ bytes: 900, quantity: 4 });
      setLimits([buildLimit({ limitValue: 500 })]);

      await expect(assertStockAvailable(1)).rejects.toMatchObject({
        code: UsageLimitExceptionCode.STOCK_EXHAUSTED,
      });
    });

    it('ignores an application stock when another application is writing', async () => {
      setLimits([
        buildLimit({
          id: 'limit-app',
          spenderType: 'application',
          spenderId: APPLICATION_ID,
        }),
      ]);

      await assertStockAvailable(10_000, { applicationId: 'another-app' });

      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('caps the writing application against its own counter', async () => {
      setLimits([
        buildLimit({
          id: 'limit-app',
          spenderType: 'application',
          spenderId: APPLICATION_ID,
        }),
      ]);
      cacheStorage.mget.mockResolvedValue([100]);

      await expect(
        assertStockAvailable(101, { applicationId: APPLICATION_ID }),
      ).rejects.toMatchObject({
        exhaustedScope: {
          spenderType: 'application',
          spenderId: APPLICATION_ID,
        },
      });

      expect(cacheStorage.mget).toHaveBeenCalledWith([APPLICATION_BYTES_KEY]);
    });

    it('warms an application counter from that application rows alone', async () => {
      setLimits([
        buildLimit({
          id: 'limit-app',
          spenderType: 'application',
          spenderId: APPLICATION_ID,
        }),
      ]);
      setHeld({ bytes: 250, quantity: 1 });

      await assertStockAvailable(1, { applicationId: APPLICATION_ID });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'file.applicationId = :applicationId',
        { applicationId: APPLICATION_ID },
      );
    });

    it('stops enforcing an application stock without the entitlement', async () => {
      entitlementProvider.hasIntraWorkspaceLimitEntitlement.mockResolvedValue(
        false,
      );
      setLimits([
        buildLimit({
          id: 'limit-app',
          spenderType: 'application',
          spenderId: APPLICATION_ID,
        }),
      ]);

      await assertStockAvailable(10_000, { applicationId: APPLICATION_ID });

      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('keeps enforcing a workspace stock without the entitlement', async () => {
      entitlementProvider.hasIntraWorkspaceLimitEntitlement.mockResolvedValue(
        false,
      );
      cacheStorage.mget.mockResolvedValue([10]);

      await expect(assertStockAvailable(11)).rejects.toMatchObject({
        code: UsageLimitExceptionCode.STOCK_EXHAUSTED,
      });
    });

    it('does not read the cache when the workspace has no stock limit', async () => {
      setLimits([]);

      await assertStockAvailable(10_000);

      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('ignores a quota limit on the same resource', async () => {
      setLimits([buildLimit({ limitKind: 'quota', meter: 'quantity' })]);

      await assertStockAvailable(10_000);

      expect(cacheStorage.mget).not.toHaveBeenCalled();
    });

    it('warms once under contention', async () => {
      cacheStorage.mget
        .mockResolvedValueOnce([undefined])
        .mockResolvedValue([700]);

      await assertStockAvailable(1);

      expect(cacheStorage.mset).not.toHaveBeenCalled();
    });

    it('admits when the workspace cache is down rather than blocking a write', async () => {
      workspaceCacheService.getOrRecompute.mockRejectedValue(
        new Error('workspace cache is down'),
      );

      await expect(assertStockAvailable(10_000)).resolves.toBeUndefined();

      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.UsageLimitStockAdmittedOnFailure,
        amount: 1,
      });
    });

    it('admits and counts the failure when the warm query throws', async () => {
      queryBuilder.getRawOne.mockRejectedValue(new Error('database is down'));

      await expect(assertStockAvailable(10_000)).resolves.toBeUndefined();

      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.UsageLimitStockAdmittedOnFailure,
        amount: 1,
      });
    });
  });

  describe('acquireStock and releaseStock', () => {
    it('debits only the meters the cost carries', async () => {
      cacheStorage.mget.mockResolvedValue([100]);
      setLimits([
        buildLimit(),
        buildLimit({ id: 'limit-2', meter: 'quantity' }),
      ]);

      await service.acquireStock({
        workspaceId: WORKSPACE_ID,
        resourceType: UsageResourceType.STORAGE,
        operationType: UsageOperationType.STORAGE_FILE,
        spenders: {},
        cost: { bytes: 40 },
      });

      expect(cacheStorage.runScript).toHaveBeenCalledWith(
        expect.objectContaining({ keys: [BYTES_KEY], args: ['[40]'] }),
      );
    });

    it('hands the release script the limit as its ceiling', async () => {
      await service.releaseStock({
        workspaceId: WORKSPACE_ID,
        resourceType: UsageResourceType.STORAGE,
        operationType: UsageOperationType.STORAGE_FILE,
        spenders: {},
        cost: { bytes: 40, quantity: 0 },
      });

      expect(cacheStorage.runScript).toHaveBeenCalledWith({
        script: RELEASE_STOCK_COUNTERS_SCRIPT,
        keys: [BYTES_KEY],
        args: ['[40]', '[1000]'],
      });
    });

    it('never fails the write it is accounting for', async () => {
      workspaceCacheService.getOrRecompute.mockRejectedValue(
        new Error('workspace cache is down'),
      );

      await expect(
        service.acquireStock({
          workspaceId: WORKSPACE_ID,
          resourceType: UsageResourceType.STORAGE,
          operationType: UsageOperationType.STORAGE_FILE,
          spenders: {},
          cost: { bytes: 40 },
        }),
      ).resolves.toBeUndefined();

      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.UsageLimitStockAdmittedOnFailure,
        amount: 1,
      });
    });

    it('stays quiet when nothing moved', async () => {
      await service.releaseStock({
        workspaceId: WORKSPACE_ID,
        resourceType: UsageResourceType.STORAGE,
        operationType: UsageOperationType.STORAGE_FILE,
        spenders: {},
        cost: { bytes: 0 },
      });

      expect(cacheStorage.runScript).not.toHaveBeenCalled();
    });
  });
});
