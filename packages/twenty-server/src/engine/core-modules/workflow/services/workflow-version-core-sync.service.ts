import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import { publishCronTriggerCacheEntry } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/utils/publish-cron-trigger-cache-entry.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class WorkflowVersionCoreSyncService {
  private readonly logger = new Logger(WorkflowVersionCoreSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

  async resolveDispatchedCoreVersionId({
    workspaceId,
    coreWorkflowVersionId,
    workspaceWorkflowVersionId,
    lastPublishedCoreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId?: string | null;
    workspaceWorkflowVersionId?: string | null;
    lastPublishedCoreWorkflowVersionId?: string | null;
  }): Promise<string | undefined> {
    if (isDefined(coreWorkflowVersionId)) {
      return coreWorkflowVersionId;
    }

    if (isDefined(workspaceWorkflowVersionId)) {
      return (
        await this.findCoreVersionByWorkspaceVersionId(
          workspaceId,
          workspaceWorkflowVersionId,
        )
      )?.id;
    }

    return lastPublishedCoreWorkflowVersionId ?? undefined;
  }

  async findCoreVersionByWorkspaceVersionId(
    workspaceId: string,
    workspaceWorkflowVersionId: string,
  ): Promise<WorkflowVersionEntity | null> {
    const aliasedCoreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { workspaceWorkflowVersionId } },
    );

    if (isDefined(aliasedCoreVersion)) {
      return aliasedCoreVersion;
    }

    const linkedCoreVersionId =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersion = await this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
          )
          .findOne({
            where: { id: workspaceWorkflowVersionId },
            select: { coreWorkflowVersionId: true },
          });

        return workflowVersion?.coreWorkflowVersionId ?? null;
      }, buildSystemAuthContext(workspaceId));

    if (!isNonEmptyString(linkedCoreVersionId)) {
      return null;
    }

    const linkedCoreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { id: linkedCoreVersionId } },
    );

    return isDefined(linkedCoreVersion) &&
      !isDefined(linkedCoreVersion.workspaceWorkflowVersionId)
      ? linkedCoreVersion
      : null;
  }

  async findWorkspaceVersionIdByCoreVersionId(
    workspaceId: string,
    coreWorkflowVersionId: string,
  ): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersion = await this.workspaceOrmManager
        .getRepositoryWithoutPermissionChecks<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
        )
        .findOne({ where: { coreWorkflowVersionId }, select: { id: true } });

      return workflowVersion?.id ?? null;
    }, buildSystemAuthContext(workspaceId));
  }
  async invalidateAutomatedTriggerMaps(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }
}
