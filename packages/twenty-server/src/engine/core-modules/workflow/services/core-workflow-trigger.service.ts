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
import { publishCronTriggerCacheEntry } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/publish-cron-trigger-cache-entry.util';
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
    for (const cachedTrigger of cachedTriggers) {
      await publishCronTriggerCacheEntry({
        cacheStorageService: this.cacheStorageService,
        cachedTrigger,
        logger: this.logger,
      });
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

  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
