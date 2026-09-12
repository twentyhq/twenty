import { Injectable, Logger } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { computeAutomatedTriggerFromWorkflowVersion } from 'src/engine/core-modules/workflow/utils/compute-automated-trigger-from-workflow-version.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
@WorkspaceCache('workflowAutomatedTriggerMaps', { packingPonderation: 1 })
export class WorkspaceWorkflowAutomatedTriggerMapCacheService extends WorkspaceCacheProvider<WorkflowAutomatedTriggerMaps> {
  private readonly logger = new Logger(
    WorkspaceWorkflowAutomatedTriggerMapCacheService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly workflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  async computeForCache({
    workspaceId,
  }: WorkspaceCacheProviderContext): Promise<WorkflowAutomatedTriggerMaps> {
    const activeWorkflowVersions = await this.workflowVersionRepository.find(
      workspaceId,
      { where: { status: WorkflowVersionStatus.ACTIVE } },
    );

    const workspaceVersionIdByCoreVersionId =
      await this.findWorkspaceVersionIdByCoreVersionId({
        workspaceId,
        activeWorkflowVersions,
      });

    const byWorkflowId: WorkflowAutomatedTriggerMaps['byWorkflowId'] = {};

    for (const workflowVersion of activeWorkflowVersions) {
      const automatedTrigger = computeAutomatedTriggerFromWorkflowVersion({
        workflowVersion,
        workspaceWorkflowVersionId:
          workspaceVersionIdByCoreVersionId[workflowVersion.id] ?? null,
      });

      if (isDefined(automatedTrigger)) {
        byWorkflowId[workflowVersion.workflowId] = automatedTrigger;
      }
    }

    return { byWorkflowId };
  }

  private async findWorkspaceVersionIdByCoreVersionId({
    workspaceId,
    activeWorkflowVersions,
  }: {
    workspaceId: string;
    activeWorkflowVersions: WorkflowVersionEntity[];
  }): Promise<Record<string, string>> {
    if (activeWorkflowVersions.length === 0) {
      return {};
    }

    if (!(await this.workspaceHasCoreWorkflowVersionIdField(workspaceId))) {
      this.logger.warn(
        `workflowVersion.coreWorkflowVersionId field missing for workspace ${workspaceId}, skipping workspace twin resolution`,
      );

      return {};
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const workspaceWorkflowVersions =
        await workspaceWorkflowVersionRepository.find({
          where: {
            coreWorkflowVersionId: In(
              activeWorkflowVersions.map(
                (workflowVersion) => workflowVersion.id,
              ),
            ),
          },
          select: {
            id: true,
            workflowId: true,
            coreWorkflowVersionId: true,
          },
        });

      const workflowIdByCoreVersionId = Object.fromEntries(
        activeWorkflowVersions.map((workflowVersion) => [
          workflowVersion.id,
          workflowVersion.workflowId,
        ]),
      );

      const twinIdsByCoreVersionId = new Map<string, string[]>();

      for (const workspaceWorkflowVersion of workspaceWorkflowVersions) {
        const { coreWorkflowVersionId } = workspaceWorkflowVersion;

        if (
          !isDefined(coreWorkflowVersionId) ||
          workflowIdByCoreVersionId[coreWorkflowVersionId] !==
            workspaceWorkflowVersion.workflowId
        ) {
          continue;
        }

        twinIdsByCoreVersionId.set(coreWorkflowVersionId, [
          ...(twinIdsByCoreVersionId.get(coreWorkflowVersionId) ?? []),
          workspaceWorkflowVersion.id,
        ]);
      }

      return Object.fromEntries(
        [...twinIdsByCoreVersionId.entries()].flatMap(
          ([coreWorkflowVersionId, twinIds]) => {
            if (twinIds.length > 1) {
              this.logger.error(
                `Core workflow version ${coreWorkflowVersionId} has ${twinIds.length} workspace twins in workspace ${workspaceId}, skipping core dispatch`,
              );

              return [];
            }

            return [[coreWorkflowVersionId, twinIds[0]]];
          },
        ),
      );
    }, authContext);
  }

  private async workspaceHasCoreWorkflowVersionIdField(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workflowVersion.fields.coreWorkflowVersionId
          .universalIdentifier
      ],
    );
  }
}
