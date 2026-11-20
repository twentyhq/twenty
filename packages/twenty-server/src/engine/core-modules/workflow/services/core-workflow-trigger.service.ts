import { Injectable, Logger } from '@nestjs/common';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export class CoreWorkflowPostCommitError extends Error {
  constructor(readonly cause: unknown) {
    super(
      'Workflow changes were committed, but the trigger cache could not be refreshed',
    );
    this.name = 'CoreWorkflowPostCommitError';
  }
}

@Injectable()
export class CoreWorkflowTriggerService {
  private readonly logger = new Logger(CoreWorkflowTriggerService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async publishCronTriggerCacheEntries(
    cachedTriggers: CachedCronTrigger[],
  ): Promise<void> {
    await this.updateCronTriggerCache({
      cronTriggersToPublish: cachedTriggers,
      coreWorkflowIdsToUnschedule: [],
    });
  }

  async refreshTriggerCachesAfterCommit({
    workspaceId,
    cronTriggersToPublish = [],
    coreWorkflowIdsToUnschedule = [],
  }: {
    workspaceId: string;
    cronTriggersToPublish?: CachedCronTrigger[];
    coreWorkflowIdsToUnschedule?: string[];
  }): Promise<void> {
    await this.updateCronTriggerCache({
      cronTriggersToPublish,
      coreWorkflowIdsToUnschedule,
    });

    try {
      await this.invalidateAutomatedTriggerMaps(workspaceId);
    } catch (error) {
      throw new CoreWorkflowPostCommitError(error);
    }
  }

  async findCoreVersionById(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    return this.coreWorkflowVersionRepository.findOne(workspaceId, {
      where: { id: coreWorkflowVersionId },
    });
  }

  async findCoreWorkflowById(
    workspaceId: string,
    coreWorkflowId: string,
  ): Promise<WorkflowEntity | null> {
    return this.coreWorkflowRepository.findOne(workspaceId, {
      where: { id: coreWorkflowId },
    });
  }

  async findCoreWorkflowByIdOrWorkspaceWorkflowId(
    workspaceId: string,
    workflowId: string,
  ): Promise<WorkflowEntity | null> {
    const workflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: [{ id: workflowId }, { workspaceWorkflowId: workflowId }],
    });

    if (workflows.length > 1) {
      throw new Error(
        `Ambiguous core workflow mapping for ${workflowId} in workspace ${workspaceId}`,
      );
    }

    return workflows[0] ?? null;
  }

  private async updateCronTriggerCache({
    cronTriggersToPublish,
    coreWorkflowIdsToUnschedule,
  }: {
    cronTriggersToPublish: CachedCronTrigger[];
    coreWorkflowIdsToUnschedule: string[];
  }): Promise<void> {
    try {
      for (const coreWorkflowId of coreWorkflowIdsToUnschedule) {
        await this.cacheStorageService.hashDelete({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: coreWorkflowId,
        });
      }

      for (const cachedTrigger of cronTriggersToPublish) {
        await this.cacheStorageService.hashSetIfExists({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: cachedTrigger.workflowId,
          value: JSON.stringify(cachedTrigger),
        });
      }
    } catch (error) {
      this.logger.error(
        'Cron trigger cache not updated, dropping it so the next tick rebuilds it from the database',
        error,
      );

      try {
        await this.cacheStorageService.del(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
      } catch (invalidationError) {
        this.logger.error(invalidationError);
      }
    }
  }

  private async invalidateAutomatedTriggerMaps(
    workspaceId: string,
  ): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
