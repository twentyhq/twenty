import { Injectable } from '@nestjs/common';

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
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@Injectable()
@WorkspaceCache('workflowAutomatedTriggerMaps', { packingPonderation: 1 })
export class WorkspaceWorkflowAutomatedTriggerMapCacheService extends WorkspaceCacheProvider<WorkflowAutomatedTriggerMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly workflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

    const workspaceLinksByCoreVersionId =
      await this.findWorkspaceLinksByCoreVersionId(
        workspaceId,
        activeWorkflowVersions,
      );

    const byWorkflowId: WorkflowAutomatedTriggerMaps['byWorkflowId'] = {};

    for (const workflowVersion of activeWorkflowVersions) {
      const automatedTrigger = computeAutomatedTriggerFromWorkflowVersion(
        workflowVersion,
        workspaceLinksByCoreVersionId[workflowVersion.id] ?? {
          coreWorkflowId: null,
          workspaceWorkflowVersionId: null,
        },
      );

      if (isDefined(automatedTrigger)) {
        byWorkflowId[workflowVersion.workflowId] = automatedTrigger;
      }
    }

    return { byWorkflowId };
  }

  private async findWorkspaceLinksByCoreVersionId(
    workspaceId: string,
    activeWorkflowVersions: WorkflowVersionEntity[],
  ): Promise<
    Record<
      string,
      {
        coreWorkflowId: string | null;
        workspaceWorkflowVersionId: string | null;
      }
    >
  > {
    if (activeWorkflowVersions.length === 0) {
      return {};
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );
      const workspaceWorkflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const [workspaceWorkflows, workspaceWorkflowVersions] = await Promise.all(
        [
          workspaceWorkflowRepository.find({
            where: {
              id: In(
                activeWorkflowVersions.map(
                  (workflowVersion) => workflowVersion.workflowId,
                ),
              ),
            },
          }),
          workspaceWorkflowVersionRepository.find({
            where: {
              coreWorkflowVersionId: In(
                activeWorkflowVersions.map(
                  (workflowVersion) => workflowVersion.id,
                ),
              ),
            },
          }),
        ],
      );

      const coreWorkflowIdByWorkspaceWorkflowId = Object.fromEntries(
        workspaceWorkflows.map((workspaceWorkflow) => [
          workspaceWorkflow.id,
          workspaceWorkflow.coreWorkflowId,
        ]),
      );
      const workspaceVersionIdByCoreVersionId = Object.fromEntries(
        workspaceWorkflowVersions
          .filter((workspaceWorkflowVersion) =>
            isDefined(workspaceWorkflowVersion.coreWorkflowVersionId),
          )
          .map((workspaceWorkflowVersion) => [
            workspaceWorkflowVersion.coreWorkflowVersionId as string,
            workspaceWorkflowVersion.id,
          ]),
      );

      return Object.fromEntries(
        activeWorkflowVersions.map((workflowVersion) => [
          workflowVersion.id,
          {
            coreWorkflowId:
              coreWorkflowIdByWorkspaceWorkflowId[workflowVersion.workflowId] ??
              null,
            workspaceWorkflowVersionId:
              workspaceVersionIdByCoreVersionId[workflowVersion.id] ?? null,
          },
        ]),
      );
    }, authContext);
  }
}
