import { Injectable, Logger } from '@nestjs/common';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
      workspaceId,
      cronTriggersToPublish,
      coreWorkflowIdsToUnschedule,
    });

    try {
      await this.invalidateAutomatedTriggerMaps(workspaceId);
    } catch (error) {
      throw new CoreWorkflowMetadataException(
        `Workflow changes were committed, but the automated trigger maps of workspace ${workspaceId} could not be refreshed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        CoreWorkflowMetadataExceptionCode.TRIGGER_CACHE_REFRESH_FAILED,
      );
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

  async findCoreWorkflowById({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<WorkflowEntity | null> {
    return this.coreWorkflowRepository.findOne(workspaceId, {
      where: { id: coreWorkflowId },
    });
  }

  async findCoreWorkflowByIdOrWorkspaceWorkflowId({
    workspaceId,
    workflowId,
  }: {
    workspaceId: string;
    workflowId: string;
  }): Promise<WorkflowEntity | null> {
    const workflows = await this.coreWorkflowRepository.find(workspaceId, {
      where: [{ id: workflowId }, { workspaceWorkflowId: workflowId }],
    });

    if (workflows.length > 1) {
      throw new CoreWorkflowMetadataException(
        `Ambiguous core workflow mapping for ${workflowId} in workspace ${workspaceId}`,
        CoreWorkflowMetadataExceptionCode.AMBIGUOUS_WORKFLOW_IDENTIFIER,
      );
    }

    return workflows[0] ?? null;
  }

  private async updateCronTriggerCache({
    workspaceId,
    cronTriggersToPublish,
    coreWorkflowIdsToUnschedule,
  }: {
    workspaceId?: string;
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
      const affectedWorkflows = [
        ...coreWorkflowIdsToUnschedule.map(
          (coreWorkflowId) => `${coreWorkflowId} (workspace ${workspaceId})`,
        ),
        ...cronTriggersToPublish.map(
          (cachedTrigger) =>
            `${cachedTrigger.workflowId} (workspace ${cachedTrigger.workspaceId})`,
        ),
      ].join(', ');

      this.logger.error(
        `Cron trigger cache not updated for workflows ${affectedWorkflows}, dropping it so the next tick rebuilds it from the database`,
        error,
      );

      try {
        await this.cacheStorageService.del(WORKFLOW_CRON_TRIGGER_CACHE_KEY);
      } catch (invalidationError) {
        this.logger.error(
          `Cron trigger cache could not be dropped after a failed update for workflows ${affectedWorkflows}`,
          invalidationError,
        );
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
