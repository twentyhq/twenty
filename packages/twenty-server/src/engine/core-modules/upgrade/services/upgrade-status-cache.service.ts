import { Injectable, Logger } from '@nestjs/common';
import { UpgradeHealthEnum } from 'twenty-shared/types';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  type InstanceUpgradeStatus,
  type LatestUpgradeCommand,
  UpgradeStatusService,
  type WorkspaceUpgradeStatus,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

export type AllWorkspacesStatusSummary = {
  instanceUpgradeStatus: InstanceUpgradeStatus;
  totalCount: number;
  upToDateCount: number;
  behindCount: number;
  failedCount: number;
  computedAt: Date;
};

export type AllWorkspacesStatus = AllWorkspacesStatusSummary & {
  workspacesBehindIds: string[];
  workspacesFailedIds: string[];
};

type CachedLatestUpgradeCommand = Omit<LatestUpgradeCommand, 'createdAt'> & {
  createdAt: string;
};

type CachedInstanceUpgradeStatus = Omit<
  InstanceUpgradeStatus,
  'latestCommand'
> & {
  latestCommand: CachedLatestUpgradeCommand | null;
};

type CachedWorkspaceUpgradeStatus = Omit<
  WorkspaceUpgradeStatus,
  'latestCommand'
> & {
  latestCommand: CachedLatestUpgradeCommand | null;
};

type CachedAllWorkspacesStatusSummary = Omit<
  AllWorkspacesStatusSummary,
  'instanceUpgradeStatus' | 'computedAt'
> & {
  instanceUpgradeStatus: CachedInstanceUpgradeStatus;
  computedAt: string;
};

const UPGRADE_STATUS_KEY_PREFIX = 'upgrade-status';
const ALL_WORKSPACES_SUMMARY_KEY = `${UPGRADE_STATUS_KEY_PREFIX}:all-workspaces:summary`;
const ALL_WORKSPACES_BEHIND_KEY = `${UPGRADE_STATUS_KEY_PREFIX}:all-workspaces:behind-ids`;
const ALL_WORKSPACES_FAILED_KEY = `${UPGRADE_STATUS_KEY_PREFIX}:all-workspaces:failed-ids`;
const WORKSPACE_KEY_PREFIX = `${UPGRADE_STATUS_KEY_PREFIX}:workspace`;

const CACHE_TTL_MS = 60 * 60 * 1000;

const AGGREGATE_KEYS = [
  ALL_WORKSPACES_SUMMARY_KEY,
  ALL_WORKSPACES_BEHIND_KEY,
  ALL_WORKSPACES_FAILED_KEY,
];

@Injectable()
export class UpgradeStatusCacheService {
  private readonly logger = new Logger(UpgradeStatusCacheService.name);

  constructor(
    private readonly upgradeStatusService: UpgradeStatusService,
    @InjectCacheStorage(CacheStorageNamespace.EngineHealth)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async getAllWorkspacesStatus(): Promise<AllWorkspacesStatus> {
    const fromCache = await this.readAllWorkspacesStatusFromCache();

    if (isDefined(fromCache)) {
      return fromCache;
    }

    return this.recomputeAllWorkspaces();
  }

  async getWorkspacesStatus(
    workspaceIds: string[],
  ): Promise<WorkspaceUpgradeStatus[]> {
    if (workspaceIds.length === 0) {
      return [];
    }

    const { result, missingIndexesByWorkspaceId } =
      await this.readCachedWorkspaceStatuses(workspaceIds);

    if (missingIndexesByWorkspaceId.size === 0) {
      return result.filter(isDefined);
    }

    const recomputedByWorkspaceId = await this.recomputeMissingWorkspaceCaches([
      ...missingIndexesByWorkspaceId.keys(),
    ]);

    for (const [workspaceId, recomputedStatus] of recomputedByWorkspaceId) {
      for (const index of missingIndexesByWorkspaceId.get(workspaceId) ?? []) {
        result[index] = recomputedStatus;
      }
    }

    if (recomputedByWorkspaceId.size > 0) {
      await this.reconcileAggregatesForWorkspaces([
        ...recomputedByWorkspaceId.values(),
      ]);
    }

    return result.filter(isDefined);
  }

  async recomputeAllWorkspaces(): Promise<AllWorkspacesStatus> {
    this.logger.log('Recomputing upgrade status for all workspaces');

    const [instanceUpgradeStatus, workspaceStatuses] = await Promise.all([
      this.upgradeStatusService.getInstanceStatus(),
      this.upgradeStatusService.getWorkspaceStatuses(),
    ]);

    const workspacesBehindIds: string[] = [];
    const workspacesFailedIds: string[] = [];

    for (const workspaceStatus of workspaceStatuses) {
      switch (workspaceStatus.health) {
        case UpgradeHealthEnum.behind:
          workspacesBehindIds.push(workspaceStatus.workspaceId);
          break;
        case UpgradeHealthEnum.failed:
          workspacesFailedIds.push(workspaceStatus.workspaceId);
          break;
      }
    }

    const summary: AllWorkspacesStatusSummary = {
      instanceUpgradeStatus,
      totalCount: workspaceStatuses.length,
      upToDateCount:
        workspaceStatuses.length -
        workspacesBehindIds.length -
        workspacesFailedIds.length,
      behindCount: workspacesBehindIds.length,
      failedCount: workspacesFailedIds.length,
      computedAt: new Date(),
    };

    await Promise.all([
      this.cacheStorage.set(
        ALL_WORKSPACES_SUMMARY_KEY,
        this.toCachedSummary(summary),
        CACHE_TTL_MS,
      ),
      this.cacheStorage.set(
        ALL_WORKSPACES_BEHIND_KEY,
        workspacesBehindIds,
        CACHE_TTL_MS,
      ),
      this.cacheStorage.set(
        ALL_WORKSPACES_FAILED_KEY,
        workspacesFailedIds,
        CACHE_TTL_MS,
      ),
      this.cacheStorage.mset(
        workspaceStatuses.map((workspaceStatus) => ({
          key: this.workspaceKey(workspaceStatus.workspaceId),
          value: workspaceStatus,
          ttl: CACHE_TTL_MS,
        })),
      ),
    ]);

    return {
      ...summary,
      workspacesBehindIds,
      workspacesFailedIds,
    };
  }

  async invalidateWorkspace(workspaceId: string): Promise<void> {
    await this.cacheStorage.del(this.workspaceKey(workspaceId));
    await this.invalidateAllWorkspacesAggregate();
  }

  async invalidateAllWorkspacesAggregate(): Promise<void> {
    await this.cacheStorage.mdel(AGGREGATE_KEYS);
  }

  async invalidateAll(): Promise<void> {
    await this.cacheStorage.flushByPattern(`${UPGRADE_STATUS_KEY_PREFIX}:*`);
  }

  private async readCachedWorkspaceStatuses(workspaceIds: string[]): Promise<{
    result: (WorkspaceUpgradeStatus | undefined)[];
    missingIndexesByWorkspaceId: Map<string, number[]>;
  }> {
    const cachedStatuses =
      await this.cacheStorage.mget<CachedWorkspaceUpgradeStatus>(
        workspaceIds.map(this.workspaceKey),
      );

    const result: (WorkspaceUpgradeStatus | undefined)[] = new Array(
      workspaceIds.length,
    );
    const missingIndexesByWorkspaceId = new Map<string, number[]>();

    for (const [index, workspaceId] of workspaceIds.entries()) {
      const cached = cachedStatuses[index];

      if (isDefined(cached)) {
        result[index] = this.rehydrateWorkspaceStatus(cached);
        continue;
      }

      const indexes = missingIndexesByWorkspaceId.get(workspaceId) ?? [];

      indexes.push(index);
      missingIndexesByWorkspaceId.set(workspaceId, indexes);
    }

    return { result, missingIndexesByWorkspaceId };
  }

  private async recomputeMissingWorkspaceCaches(
    workspaceIds: string[],
  ): Promise<Map<string, WorkspaceUpgradeStatus>> {
    const recomputed = await Promise.all(
      workspaceIds.map((workspaceId) =>
        this.recomputeWorkspaceCache(workspaceId),
      ),
    );

    const recomputedByWorkspaceId = new Map<string, WorkspaceUpgradeStatus>();

    for (const [index, status] of recomputed.entries()) {
      if (isDefined(status)) {
        recomputedByWorkspaceId.set(workspaceIds[index], status);
      }
    }

    return recomputedByWorkspaceId;
  }

  private async recomputeWorkspaceCache(
    workspaceId: string,
  ): Promise<WorkspaceUpgradeStatus | null> {
    const [status] = await this.upgradeStatusService.getWorkspaceStatuses([
      workspaceId,
    ]);

    if (!isDefined(status)) {
      await this.cacheStorage.del(this.workspaceKey(workspaceId));

      return null;
    }

    await this.cacheStorage.set(
      this.workspaceKey(workspaceId),
      status,
      CACHE_TTL_MS,
    );

    return status;
  }

  private async readAllWorkspacesStatusFromCache(): Promise<
    AllWorkspacesStatus | undefined
  > {
    const [summary, behindIds, failedIds] = await Promise.all([
      this.cacheStorage.get<CachedAllWorkspacesStatusSummary>(
        ALL_WORKSPACES_SUMMARY_KEY,
      ),
      this.cacheStorage.get<string[]>(ALL_WORKSPACES_BEHIND_KEY),
      this.cacheStorage.get<string[]>(ALL_WORKSPACES_FAILED_KEY),
    ]);

    if (!isDefined(summary) || !isDefined(behindIds) || !isDefined(failedIds)) {
      return undefined;
    }

    return {
      ...summary,
      instanceUpgradeStatus: this.rehydrateInstanceStatus(
        summary.instanceUpgradeStatus,
      ),
      computedAt: new Date(summary.computedAt),
      workspacesBehindIds: behindIds,
      workspacesFailedIds: failedIds,
    };
  }

  // Single batched read → compute → write of summary/behindIds/failedIds for
  // all workspaces refreshed in this call. Concurrent calls from different
  // requests can still race, but each individual getWorkspacesStatus call
  // performs at most one reconciliation regardless of how many workspaces it
  // refreshed. If the aggregate is not present we bail out: the next
  // getAllWorkspacesStatus will fully recompute it.
  private async reconcileAggregatesForWorkspaces(
    statuses: WorkspaceUpgradeStatus[],
  ): Promise<void> {
    if (statuses.length === 0) {
      return;
    }

    const [summary, behindIds, failedIds] = await Promise.all([
      this.cacheStorage.get<CachedAllWorkspacesStatusSummary>(
        ALL_WORKSPACES_SUMMARY_KEY,
      ),
      this.cacheStorage.get<string[]>(ALL_WORKSPACES_BEHIND_KEY),
      this.cacheStorage.get<string[]>(ALL_WORKSPACES_FAILED_KEY),
    ]);

    if (!isDefined(summary) || !isDefined(behindIds) || !isDefined(failedIds)) {
      return;
    }

    const updatedWorkspaceIds = new Set(
      statuses.map((status) => status.workspaceId),
    );

    const nextBehind = behindIds.filter((id) => !updatedWorkspaceIds.has(id));
    const nextFailed = failedIds.filter((id) => !updatedWorkspaceIds.has(id));

    for (const status of statuses) {
      switch (status.health) {
        case UpgradeHealthEnum.behind:
          nextBehind.push(status.workspaceId);
          break;
        case UpgradeHealthEnum.failed:
          nextFailed.push(status.workspaceId);
          break;
      }
    }

    const nextSummary: CachedAllWorkspacesStatusSummary = {
      ...summary,
      upToDateCount: summary.totalCount - nextBehind.length - nextFailed.length,
      behindCount: nextBehind.length,
      failedCount: nextFailed.length,
      computedAt: new Date().toISOString(),
    };

    await Promise.all([
      this.cacheStorage.set(
        ALL_WORKSPACES_SUMMARY_KEY,
        nextSummary,
        CACHE_TTL_MS,
      ),
      this.cacheStorage.set(
        ALL_WORKSPACES_BEHIND_KEY,
        nextBehind,
        CACHE_TTL_MS,
      ),
      this.cacheStorage.set(
        ALL_WORKSPACES_FAILED_KEY,
        nextFailed,
        CACHE_TTL_MS,
      ),
    ]);
  }

  private workspaceKey = (workspaceId: string): string =>
    `${WORKSPACE_KEY_PREFIX}:${workspaceId}`;

  private toCachedSummary(
    summary: AllWorkspacesStatusSummary,
  ): CachedAllWorkspacesStatusSummary {
    return {
      ...summary,
      instanceUpgradeStatus: this.toCachedInstanceStatus(
        summary.instanceUpgradeStatus,
      ),
      computedAt: summary.computedAt.toISOString(),
    };
  }

  private toCachedInstanceStatus(
    status: InstanceUpgradeStatus,
  ): CachedInstanceUpgradeStatus {
    return {
      ...status,
      latestCommand: isDefined(status.latestCommand)
        ? {
            ...status.latestCommand,
            createdAt: status.latestCommand.createdAt.toISOString(),
          }
        : null,
    };
  }

  private rehydrateInstanceStatus(
    cached: CachedInstanceUpgradeStatus,
  ): InstanceUpgradeStatus {
    return {
      ...cached,
      latestCommand: isDefined(cached.latestCommand)
        ? {
            ...cached.latestCommand,
            createdAt: new Date(cached.latestCommand.createdAt),
          }
        : null,
    };
  }

  private rehydrateWorkspaceStatus(
    cached: CachedWorkspaceUpgradeStatus,
  ): WorkspaceUpgradeStatus {
    return {
      ...cached,
      latestCommand: isDefined(cached.latestCommand)
        ? {
            ...cached.latestCommand,
            createdAt: new Date(cached.latestCommand.createdAt),
          }
        : null,
    };
  }
}
