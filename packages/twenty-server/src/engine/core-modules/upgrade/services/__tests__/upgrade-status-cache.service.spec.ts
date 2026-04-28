import { Test } from '@nestjs/testing';

import { UpgradeHealthEnum } from 'twenty-shared/types';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import {
  type InstanceUpgradeStatus,
  UpgradeStatusService,
  type WorkspaceUpgradeStatus,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

const SUMMARY_KEY = 'upgrade-status:all-workspaces:summary';
const BEHIND_KEY = 'upgrade-status:all-workspaces:behind-ids';
const FAILED_KEY = 'upgrade-status:all-workspaces:failed-ids';
const workspaceKey = (workspaceId: string) =>
  `upgrade-status:workspace:${workspaceId}`;

class FakeCacheStorage {
  store = new Map<string, unknown>();

  get = jest.fn(async <T,>(key: string): Promise<T | undefined> => {
    return this.store.get(key) as T | undefined;
  });

  set = jest.fn(async (key: string, value: unknown): Promise<void> => {
    this.store.set(key, value);
  });

  del = jest.fn(async (key: string): Promise<void> => {
    this.store.delete(key);
  });

  mget = jest.fn(async <T,>(keys: string[]): Promise<(T | undefined)[]> => {
    return keys.map((key) => this.store.get(key) as T | undefined);
  });

  mset = jest.fn(
    async (
      entries: Array<{ key: string; value: unknown; ttl?: number }>,
    ): Promise<void> => {
      for (const { key, value } of entries) {
        this.store.set(key, value);
      }
    },
  );

  mdel = jest.fn(async (keys: string[]): Promise<void> => {
    for (const key of keys) {
      this.store.delete(key);
    }
  });

  flushByPattern = jest.fn(async (pattern: string): Promise<void> => {
    const matcher = new RegExp(`^${pattern.replace('*', '.*')}$`);

    for (const key of [...this.store.keys()]) {
      if (matcher.test(key)) {
        this.store.delete(key);
      }
    }
  });
}

const buildInstanceStatus = (
  overrides: Partial<InstanceUpgradeStatus> = {},
): InstanceUpgradeStatus => ({
  inferredVersion: '1.23.0',
  health: UpgradeHealthEnum.upToDate,
  latestCommand: {
    name: '1.23.0_LastInstanceCommand_1780000002000',
    status: 'completed',
    executedByVersion: '1.23.0',
    errorMessage: null,
    createdAt: new Date('2025-06-01T00:00:00Z'),
  },
  ...overrides,
});

const buildWorkspaceStatus = (
  overrides: Partial<WorkspaceUpgradeStatus> = {},
): WorkspaceUpgradeStatus => ({
  workspaceId: 'ws-1',
  displayName: 'Apple',
  inferredVersion: '1.23.0',
  health: UpgradeHealthEnum.upToDate,
  latestCommand: {
    name: '1.23.0_LastWorkspaceCommand_1780000003000',
    status: 'completed',
    executedByVersion: '1.23.0',
    errorMessage: null,
    createdAt: new Date('2025-06-01T00:00:00Z'),
  },
  ...overrides,
});

describe('UpgradeStatusCacheService', () => {
  let service: UpgradeStatusCacheService;
  let cacheStorage: FakeCacheStorage;
  let getInstanceStatus: jest.Mock;
  let getWorkspaceStatuses: jest.Mock;

  beforeEach(async () => {
    cacheStorage = new FakeCacheStorage();
    getInstanceStatus = jest.fn();
    getWorkspaceStatuses = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        UpgradeStatusCacheService,
        {
          provide: UpgradeStatusService,
          useValue: { getInstanceStatus, getWorkspaceStatuses },
        },
        {
          provide: CacheStorageNamespace.EngineHealth,
          useValue: cacheStorage as unknown as CacheStorageService,
        },
      ],
    }).compile();

    service = module.get(UpgradeStatusCacheService);
  });

  describe('getAllWorkspacesStatus', () => {
    it('should return cached aggregate when all three keys are present', async () => {
      const computedAt = new Date('2025-06-02T10:00:00Z');

      cacheStorage.store.set(SUMMARY_KEY, {
        instanceUpgradeStatus: {
          inferredVersion: '1.23.0',
          health: UpgradeHealthEnum.upToDate,
          latestCommand: null,
        },
        totalCount: 3,
        upToDateCount: 2,
        behindCount: 1,
        failedCount: 0,
        computedAt: computedAt.toISOString(),
      });
      cacheStorage.store.set(BEHIND_KEY, ['ws-2']);
      cacheStorage.store.set(FAILED_KEY, []);

      const result = await service.getAllWorkspacesStatus();

      expect(result.totalCount).toBe(3);
      expect(result.upToDateCount).toBe(2);
      expect(result.behindCount).toBe(1);
      expect(result.workspacesBehindIds).toEqual(['ws-2']);
      expect(result.computedAt).toEqual(computedAt);
      expect(getInstanceStatus).not.toHaveBeenCalled();
      expect(getWorkspaceStatuses).not.toHaveBeenCalled();
    });

    it('should recompute when any aggregate key is missing', async () => {
      cacheStorage.store.set(BEHIND_KEY, []);
      cacheStorage.store.set(FAILED_KEY, []);

      getInstanceStatus.mockResolvedValue(buildInstanceStatus());
      getWorkspaceStatuses.mockResolvedValue([
        buildWorkspaceStatus({ workspaceId: 'ws-1' }),
      ]);

      const result = await service.getAllWorkspacesStatus();

      expect(result.totalCount).toBe(1);
      expect(getInstanceStatus).toHaveBeenCalledTimes(1);
      expect(getWorkspaceStatuses).toHaveBeenCalledTimes(1);
      expect(cacheStorage.store.get(SUMMARY_KEY)).toBeDefined();
    });
  });

  describe('getWorkspacesStatus', () => {
    it('should return empty array when no workspace ids are provided', async () => {
      const result = await service.getWorkspacesStatus([]);

      expect(result).toEqual([]);
      expect(cacheStorage.mget).not.toHaveBeenCalled();
      expect(getWorkspaceStatuses).not.toHaveBeenCalled();
    });

    it('should serve cached entries without calling the underlying service', async () => {
      const cached = buildWorkspaceStatus({
        workspaceId: 'ws-1',
        latestCommand: {
          name: 'cmd',
          status: 'completed',
          executedByVersion: '1.23.0',
          errorMessage: null,
          createdAt: new Date(
            '2025-06-01T00:00:00Z',
          ).toISOString() as unknown as Date,
        },
      });

      cacheStorage.store.set(workspaceKey('ws-1'), cached);

      const result = await service.getWorkspacesStatus(['ws-1']);

      expect(result).toHaveLength(1);
      expect(result[0].workspaceId).toBe('ws-1');
      expect(result[0].latestCommand?.createdAt).toBeInstanceOf(Date);
      expect(getWorkspaceStatuses).not.toHaveBeenCalled();
    });

    it('should recompute missing workspaces and reconcile aggregates only once for the batch', async () => {
      cacheStorage.store.set(SUMMARY_KEY, {
        instanceUpgradeStatus: {
          inferredVersion: '1.23.0',
          health: UpgradeHealthEnum.upToDate,
          latestCommand: null,
        },
        totalCount: 3,
        upToDateCount: 3,
        behindCount: 0,
        failedCount: 0,
        computedAt: new Date('2025-06-01T00:00:00Z').toISOString(),
      });
      cacheStorage.store.set(BEHIND_KEY, []);
      cacheStorage.store.set(FAILED_KEY, []);

      getWorkspaceStatuses.mockImplementation(
        async (workspaceIds: string[]) => {
          const id = workspaceIds[0];

          return [
            buildWorkspaceStatus({
              workspaceId: id,
              health:
                id === 'ws-1'
                  ? UpgradeHealthEnum.behind
                  : UpgradeHealthEnum.failed,
            }),
          ];
        },
      );

      const result = await service.getWorkspacesStatus(['ws-1', 'ws-2']);

      expect(result).toHaveLength(2);
      expect(getWorkspaceStatuses).toHaveBeenCalledTimes(2);

      // Reconciliation should read the aggregates exactly once for the batch
      const aggregateReads = cacheStorage.get.mock.calls.filter(([key]) =>
        [SUMMARY_KEY, BEHIND_KEY, FAILED_KEY].includes(key as string),
      );

      expect(aggregateReads).toHaveLength(3);

      expect(cacheStorage.store.get(BEHIND_KEY)).toEqual(['ws-1']);
      expect(cacheStorage.store.get(FAILED_KEY)).toEqual(['ws-2']);

      const summary = cacheStorage.store.get(SUMMARY_KEY) as {
        upToDateCount: number;
        behindCount: number;
        failedCount: number;
      };

      expect(summary.behindCount).toBe(1);
      expect(summary.failedCount).toBe(1);
      expect(summary.upToDateCount).toBe(1);
    });

    it('should not write aggregate keys when aggregates are absent (no reconcile target)', async () => {
      getWorkspaceStatuses.mockImplementation(
        async (workspaceIds: string[]) => [
          buildWorkspaceStatus({
            workspaceId: workspaceIds[0],
            health: UpgradeHealthEnum.behind,
          }),
        ],
      );

      const result = await service.getWorkspacesStatus(['ws-1']);

      expect(result).toHaveLength(1);
      expect(cacheStorage.store.has(SUMMARY_KEY)).toBe(false);
      expect(cacheStorage.store.has(BEHIND_KEY)).toBe(false);
      expect(cacheStorage.store.has(FAILED_KEY)).toBe(false);
    });

    it('should remove a workspace from previous bucket when its health becomes upToDate', async () => {
      cacheStorage.store.set(SUMMARY_KEY, {
        instanceUpgradeStatus: {
          inferredVersion: '1.23.0',
          health: UpgradeHealthEnum.upToDate,
          latestCommand: null,
        },
        totalCount: 2,
        upToDateCount: 1,
        behindCount: 1,
        failedCount: 0,
        computedAt: new Date('2025-06-01T00:00:00Z').toISOString(),
      });
      cacheStorage.store.set(BEHIND_KEY, ['ws-1']);
      cacheStorage.store.set(FAILED_KEY, []);

      getWorkspaceStatuses.mockResolvedValue([
        buildWorkspaceStatus({
          workspaceId: 'ws-1',
          health: UpgradeHealthEnum.upToDate,
        }),
      ]);

      await service.getWorkspacesStatus(['ws-1']);

      expect(cacheStorage.store.get(BEHIND_KEY)).toEqual([]);
      expect(cacheStorage.store.get(FAILED_KEY)).toEqual([]);

      const summary = cacheStorage.store.get(SUMMARY_KEY) as {
        upToDateCount: number;
        behindCount: number;
      };

      expect(summary.behindCount).toBe(0);
      expect(summary.upToDateCount).toBe(2);
    });
  });

  describe('recomputeAllWorkspaces', () => {
    it('should write per-workspace caches and aggregate keys', async () => {
      getInstanceStatus.mockResolvedValue(buildInstanceStatus());
      getWorkspaceStatuses.mockResolvedValue([
        buildWorkspaceStatus({
          workspaceId: 'ws-1',
          health: UpgradeHealthEnum.upToDate,
        }),
        buildWorkspaceStatus({
          workspaceId: 'ws-2',
          health: UpgradeHealthEnum.behind,
        }),
        buildWorkspaceStatus({
          workspaceId: 'ws-3',
          health: UpgradeHealthEnum.failed,
        }),
      ]);

      const result = await service.recomputeAllWorkspaces();

      expect(result.totalCount).toBe(3);
      expect(result.upToDateCount).toBe(1);
      expect(result.behindCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.workspacesBehindIds).toEqual(['ws-2']);
      expect(result.workspacesFailedIds).toEqual(['ws-3']);

      expect(cacheStorage.store.has(workspaceKey('ws-1'))).toBe(true);
      expect(cacheStorage.store.has(workspaceKey('ws-2'))).toBe(true);
      expect(cacheStorage.store.has(workspaceKey('ws-3'))).toBe(true);
      expect(cacheStorage.store.get(BEHIND_KEY)).toEqual(['ws-2']);
      expect(cacheStorage.store.get(FAILED_KEY)).toEqual(['ws-3']);
    });
  });

  describe('invalidateWorkspace', () => {
    it('should delete the workspace cache entry and aggregate keys', async () => {
      cacheStorage.store.set(workspaceKey('ws-1'), { workspaceId: 'ws-1' });
      cacheStorage.store.set(SUMMARY_KEY, {});
      cacheStorage.store.set(BEHIND_KEY, ['ws-1']);
      cacheStorage.store.set(FAILED_KEY, []);

      await service.invalidateWorkspace('ws-1');

      expect(cacheStorage.store.has(workspaceKey('ws-1'))).toBe(false);
      expect(cacheStorage.store.has(SUMMARY_KEY)).toBe(false);
      expect(cacheStorage.store.has(BEHIND_KEY)).toBe(false);
      expect(cacheStorage.store.has(FAILED_KEY)).toBe(false);
    });
  });

  describe('invalidateAllWorkspacesAggregate', () => {
    it('should delete the three aggregate keys', async () => {
      cacheStorage.store.set(SUMMARY_KEY, {});
      cacheStorage.store.set(BEHIND_KEY, []);
      cacheStorage.store.set(FAILED_KEY, []);

      await service.invalidateAllWorkspacesAggregate();

      expect(cacheStorage.mdel).toHaveBeenCalledWith([
        SUMMARY_KEY,
        BEHIND_KEY,
        FAILED_KEY,
      ]);
      expect(cacheStorage.store.has(SUMMARY_KEY)).toBe(false);
      expect(cacheStorage.store.has(BEHIND_KEY)).toBe(false);
      expect(cacheStorage.store.has(FAILED_KEY)).toBe(false);
    });
  });

  describe('invalidateAll', () => {
    it('should flush all keys matching the upgrade-status prefix', async () => {
      await service.invalidateAll();

      expect(cacheStorage.flushByPattern).toHaveBeenCalledWith(
        'upgrade-status:*',
      );
    });
  });
});
