import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type InstanceUpgradeStatus } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

const BEHIND_IDS_KEY = 'upgrade-status:behind-workspace-ids';
const FAILED_IDS_KEY = 'upgrade-status:failed-workspace-ids';
const UP_TO_DATE_COUNT_KEY = 'upgrade-status:up-to-date-workspace-count';
const COMPUTED_AT_KEY = 'upgrade-status:computed-at';
const INSTANCE_STATUS_KEY = 'upgrade-status:instance-status';
const FRESH_KEY = 'upgrade-status:fresh';
const REFRESH_LOCK_KEY = 'upgrade-status:refresh-lock';

const FRESH_TTL_MS = 60 * 60 * 1000;
const STATUS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_LOCK_TTL_MS = 60 * 1000;
@Injectable()
export class UpgradeStatusCacheService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async isFresh(): Promise<boolean> {
    return isDefined(await this.cacheStorage.get<boolean>(FRESH_KEY));
  }

  async getComputedAt(): Promise<Date | null> {
    const computedAt = await this.cacheStorage.get<string>(COMPUTED_AT_KEY);

    return isDefined(computedAt) ? new Date(computedAt) : null;
  }

  async getInstanceUpgradeStatus(): Promise<InstanceUpgradeStatus | null> {
    const instanceUpgradeStatus =
      await this.cacheStorage.get<InstanceUpgradeStatus>(INSTANCE_STATUS_KEY);

    if (!isDefined(instanceUpgradeStatus)) {
      return null;
    }

    return {
      ...instanceUpgradeStatus,
      latestCommand: isDefined(instanceUpgradeStatus.latestCommand)
        ? {
            ...instanceUpgradeStatus.latestCommand,
            createdAt: new Date(instanceUpgradeStatus.latestCommand.createdAt),
          }
        : null,
    };
  }

  async getBehindWorkspaceIds(): Promise<string[]> {
    return this.cacheStorage.setMembers(BEHIND_IDS_KEY);
  }

  async getFailedWorkspaceIds(): Promise<string[]> {
    return this.cacheStorage.setMembers(FAILED_IDS_KEY);
  }

  async getUpToDateWorkspaceCount(): Promise<number> {
    const raw = await this.cacheStorage.get<number>(UP_TO_DATE_COUNT_KEY);

    return isDefined(raw) ? raw : 0;
  }

  async write({
    instanceUpgradeStatus,
    behindWorkspaceIds,
    failedWorkspaceIds,
    upToDateWorkspaceCount,
    computedAt,
  }: {
    instanceUpgradeStatus: InstanceUpgradeStatus;
    behindWorkspaceIds: string[];
    failedWorkspaceIds: string[];
    upToDateWorkspaceCount: number;
    computedAt: Date;
  }): Promise<void> {
    await Promise.all([
      this.cacheStorage.del(BEHIND_IDS_KEY),
      this.cacheStorage.del(FAILED_IDS_KEY),
    ]);

    await Promise.all([
      this.cacheStorage.setAdd(
        BEHIND_IDS_KEY,
        behindWorkspaceIds,
        STATUS_TTL_MS,
      ),
      this.cacheStorage.setAdd(
        FAILED_IDS_KEY,
        failedWorkspaceIds,
        STATUS_TTL_MS,
      ),
      this.cacheStorage.set(
        UP_TO_DATE_COUNT_KEY,
        upToDateWorkspaceCount,
        STATUS_TTL_MS,
      ),
      this.cacheStorage.set(
        INSTANCE_STATUS_KEY,
        instanceUpgradeStatus,
        STATUS_TTL_MS,
      ),
      this.cacheStorage.set(
        COMPUTED_AT_KEY,
        computedAt.toISOString(),
        STATUS_TTL_MS,
      ),
    ]);

    await this.cacheStorage.set(FRESH_KEY, true, FRESH_TTL_MS);
  }

  async tryAcquireRefreshLock(): Promise<boolean> {
    return this.cacheStorage.acquireLock(REFRESH_LOCK_KEY, REFRESH_LOCK_TTL_MS);
  }

  async invalidate(): Promise<void> {
    await this.cacheStorage.del(FRESH_KEY);
  }
}
