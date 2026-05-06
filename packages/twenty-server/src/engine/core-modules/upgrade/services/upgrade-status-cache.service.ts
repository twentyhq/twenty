import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const BEHIND_IDS_KEY = 'upgrade-status:behind-workspace-ids';
const FAILED_IDS_KEY = 'upgrade-status:failed-workspace-ids';
const COMPUTED_AT_KEY = 'upgrade-status:computed-at';

const CACHE_TTL_MS = 60 * 60 * 1000;
@Injectable()
export class UpgradeStatusCacheService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async getComputedAt(): Promise<Date | null> {
    const computedAt = await this.cacheStorage.get<string>(COMPUTED_AT_KEY);

    return isDefined(computedAt) ? new Date(computedAt) : null;
  }

  async getBehindWorkspaceIds(): Promise<string[]> {
    return this.cacheStorage.setMembers(BEHIND_IDS_KEY);
  }

  async getFailedWorkspaceIds(): Promise<string[]> {
    return this.cacheStorage.setMembers(FAILED_IDS_KEY);
  }

  async write({
    behindWorkspaceIds,
    failedWorkspaceIds,
    computedAt,
  }: {
    behindWorkspaceIds: string[];
    failedWorkspaceIds: string[];
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
        CACHE_TTL_MS,
      ),
      this.cacheStorage.setAdd(
        FAILED_IDS_KEY,
        failedWorkspaceIds,
        CACHE_TTL_MS,
      ),
      this.cacheStorage.set(
        COMPUTED_AT_KEY,
        computedAt.toISOString(),
        CACHE_TTL_MS,
      ),
    ]);
  }

  async invalidate(): Promise<void> {
    await Promise.all([
      this.cacheStorage.del(BEHIND_IDS_KEY),
      this.cacheStorage.del(FAILED_IDS_KEY),
      this.cacheStorage.del(COMPUTED_AT_KEY),
    ]);
  }
}
