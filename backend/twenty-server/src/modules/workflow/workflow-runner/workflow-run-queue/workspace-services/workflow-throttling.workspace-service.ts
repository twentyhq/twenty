import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NOT_STARTED_RUNS_FIND_OPTIONS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/not-started-runs-find-options';

@Injectable()
export class WorkflowThrottlingWorkspaceService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorage: CacheStorageService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getRemainingRunsToEnqueueCount(workspaceId: string) {
    return this.throttlerService.getAvailableTokensCount(
      this.getWorkflowExecutionSoftThrottleCacheKey(workspaceId),
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_TTL'),
    );
  }

  async consumeRemainingRunsToEnqueueCount(
    workspaceId: string,
    runsToConsume: number,
  ) {
    await this.throttlerService.consumeTokens(
      this.getWorkflowExecutionSoftThrottleCacheKey(workspaceId),
      runsToConsume,
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_SOFT_THROTTLE_TTL'),
    );
  }

  async throttleOrThrowIfHardLimitReached(workspaceId: string) {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      this.getWorkflowExecutionHardThrottleCacheKey(workspaceId),
      1,
      this.twentyConfigService.get('WORKFLOW_EXEC_HARD_THROTTLE_LIMIT'),
      this.twentyConfigService.get('WORKFLOW_EXEC_HARD_THROTTLE_TTL'),
    );
  }

  async increaseWorkflowRunNotStartedCount(
    workspaceId: string,
    newlyEnqueuedCount = 1,
  ): Promise<void> {
    await this.cacheStorage.incrBy(
      this.getWorkflowRunNotStartedCountCacheKey(workspaceId),
      newlyEnqueuedCount,
    );
  }

  async decreaseWorkflowRunNotStartedCount(
    workspaceId: string,
    removedFromQueueCount = 1,
  ): Promise<void> {
    await this.cacheStorage.incrBy(
      this.getWorkflowRunNotStartedCountCacheKey(workspaceId),
      -removedFromQueueCount,
    );
  }

  async recomputeWorkflowRunNotStartedCount(
    workspaceId: string,
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    const currentlyNotStartedWorkflowRunCount =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workflowRunRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              WorkflowRunWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return workflowRunRepository.count({
            where: NOT_STARTED_RUNS_FIND_OPTIONS,
          });
        },
        authContext,
      );

    await this.setWorkflowRunNotStartedCount(
      workspaceId,
      currentlyNotStartedWorkflowRunCount,
    );
  }

  async getNotStartedRunsCountFromCache(workspaceId: string): Promise<number> {
    return this.getCurrentWorkflowRunNotStartedCount(workspaceId);
  }

  async getNotStartedRunsCountFromDatabase(
    workspaceId: string,
  ): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        return workflowRunRepository.count({
          where: NOT_STARTED_RUNS_FIND_OPTIONS,
        });
      },
      authContext,
    );
  }

  async acquireWorkflowEnqueueLock(
    workspaceId: string,
    ttlMs = 60_000,
  ): Promise<boolean> {
    const key = this.getWorkflowEnqueueRunningCacheKey(workspaceId);

    return this.cacheStorage.acquireLock(key, ttlMs);
  }

  async releaseWorkflowEnqueueLock(workspaceId: string): Promise<void> {
    const key = this.getWorkflowEnqueueRunningCacheKey(workspaceId);

    await this.cacheStorage.releaseLock(key);
  }

  private async setWorkflowRunNotStartedCount(
    workspaceId: string,
    count: number,
  ): Promise<void> {
    await this.cacheStorage.set(
      this.getWorkflowRunNotStartedCountCacheKey(workspaceId),
      count,
    );
  }

  private async getCurrentWorkflowRunNotStartedCount(
    workspaceId: string,
  ): Promise<number> {
    const key = this.getWorkflowRunNotStartedCountCacheKey(workspaceId);

    const currentCount = (await this.cacheStorage.get<number>(key)) ?? 0;

    return Math.max(0, currentCount);
  }

  private getWorkflowRunNotStartedCountCacheKey(workspaceId: string): string {
    return `workflow-run-not-started-count:${workspaceId}`;
  }

  private getWorkflowEnqueueRunningCacheKey(workspaceId: string): string {
    return `workflow-enqueue-running:${workspaceId}`;
  }

  private getWorkflowExecutionSoftThrottleCacheKey(
    workspaceId: string,
  ): string {
    return `workflow:execution-soft-throttle:${workspaceId}`;
  }

  private getWorkflowExecutionHardThrottleCacheKey(
    workspaceId: string,
  ): string {
    return `workflow:execution-hard-throttle:${workspaceId}`;
  }
}
