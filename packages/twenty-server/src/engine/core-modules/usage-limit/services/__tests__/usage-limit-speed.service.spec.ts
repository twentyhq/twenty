import { DiscoveryService } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  CacheStorageException,
  CacheStorageExceptionCode,
} from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitEntitlementProvider } from 'src/engine/core-modules/usage-limit/interfaces/usage-limit-entitlement-provider.service';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import {
  WorkspaceCacheException,
  WorkspaceCacheExceptionCode,
} from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const apiKeyContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: 'key-1' },
} as WorkspaceAuthContext;

class TestUsageLimitEntitlementProvider extends UsageLimitEntitlementProvider {
  hasIntraWorkspaceLimitEntitlement = jest.fn();
}

const buildApiKeySpeedLimit = (): FlatUsageLimit => ({
  id: 'speed-1',
  resourceType: UsageResourceType.API,
  operationType: UsageOperationType.API_REQUEST,
  spenderType: 'apiKey',
  spenderId: 'key-1',
  limitKind: 'speed',
  periodCount: 60,
  periodUnit: 'second',
  meter: 'quantity',
  limitValue: 100,
  burstValue: null,
});

describe('UsageLimitSpeedService', () => {
  let service: UsageLimitSpeedService;
  let entitlementProvider: TestUsageLimitEntitlementProvider;

  const cacheStorage = {
    runScript: jest.fn().mockResolvedValue([1, 0, 0]),
  };

  const workspaceCacheService = {
    getOrRecompute: jest
      .fn()
      .mockResolvedValue({ usageLimits: { byResourceType: {} } }),
  };

  const twentyConfigService = {
    get: jest.fn((key: string) => (key.endsWith('_IN_MS') ? 60_000 : 100)),
  };

  const consume = () =>
    service.consumeOrThrow({
      resourceType: UsageResourceType.API,
      authContext: apiKeyContext,
      operationType: UsageOperationType.API_REQUEST,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    entitlementProvider = new TestUsageLimitEntitlementProvider();
    entitlementProvider.hasIntraWorkspaceLimitEntitlement.mockResolvedValue(
      true,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitSpeedService,
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: cacheStorage,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: () => [{ instance: entitlementProvider }],
          },
        },
      ],
    }).compile();

    service = module.get<UsageLimitSpeedService>(UsageLimitSpeedService);
    service.onModuleInit();
  });

  it('admits the request when the limits cannot be read from storage', async () => {
    workspaceCacheService.getOrRecompute.mockRejectedValueOnce(
      new Error('Socket closed unexpectedly'),
    );

    await expect(consume()).resolves.toBeUndefined();
    expect(cacheStorage.runScript).not.toHaveBeenCalled();
  });

  it('surfaces a misuse of the cache api instead of degrading', async () => {
    workspaceCacheService.getOrRecompute.mockRejectedValueOnce(
      new WorkspaceCacheException(
        'Invalid parameters',
        WorkspaceCacheExceptionCode.INVALID_PARAMETERS,
      ),
    );

    await expect(consume()).rejects.toThrow(WorkspaceCacheException);
  });

  it('admits the request when the counters cannot be consumed', async () => {
    cacheStorage.runScript.mockRejectedValueOnce(
      new CacheStorageException(
        'Script execution failed',
        CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
      ),
    );

    await expect(consume()).resolves.toBeUndefined();
  });

  it('denies the request when a bucket is exhausted', async () => {
    cacheStorage.runScript.mockResolvedValueOnce([0, 1, 1500]);

    await expect(consume()).rejects.toThrow(/Rate limit exceeded/);
  });

  it('enforces a stored apiKey speed override only when the workspace is entitled', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      usageLimits: {
        byResourceType: { [UsageResourceType.API]: [buildApiKeySpeedLimit()] },
      },
    });

    await consume();
    const entitledKeyCount =
      cacheStorage.runScript.mock.calls[0][0].keys.length;

    entitlementProvider.hasIntraWorkspaceLimitEntitlement.mockResolvedValue(
      false,
    );
    await consume();
    const notEntitledKeyCount =
      cacheStorage.runScript.mock.calls[1][0].keys.length;

    expect(entitledKeyCount).toBeGreaterThan(notEntitledKeyCount);
  });
});
