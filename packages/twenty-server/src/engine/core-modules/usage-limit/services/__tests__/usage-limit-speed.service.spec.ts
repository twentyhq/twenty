import { Test, type TestingModule } from '@nestjs/testing';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  CacheStorageException,
  CacheStorageExceptionCode,
} from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitSpeedService } from 'src/engine/core-modules/usage-limit/services/usage-limit-speed.service';
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

describe('UsageLimitSpeedService', () => {
  let service: UsageLimitSpeedService;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitSpeedService,
        {
          provide: CacheStorageNamespace.EngineUsageLimit,
          useValue: cacheStorage,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        { provide: TwentyConfigService, useValue: twentyConfigService },
      ],
    }).compile();

    service = module.get<UsageLimitSpeedService>(UsageLimitSpeedService);
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
});
