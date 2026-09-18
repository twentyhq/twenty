import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { CoreWorkflowWithCurrentVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-with-current-version.dto';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class CoreWorkflowWithCurrentVersionListService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
  ) {}

  async findMany({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<CoreWorkflowWithCurrentVersionDTO[]> {
    const [coreWorkflows, coreWorkflowVersions] = await Promise.all([
      this.coreWorkflowRepository.find(workspaceId, {
        where: { id: In(coreWorkflowIds) },
      }),
      this.coreWorkflowVersionRepository.find(workspaceId, {
        where: { coreWorkflowId: In(coreWorkflowIds) },
        order: { createdAt: 'ASC', id: 'ASC' },
      }),
    ]);

    const workflowById = new Map(
      coreWorkflows.map((workflow) => [workflow.id, workflow]),
    );

    return coreWorkflowIds.flatMap((coreWorkflowId) => {
      const workflow = workflowById.get(coreWorkflowId);

      if (workflow === undefined) {
        return [];
      }

      const versionsInCreationOrder = coreWorkflowVersions.filter(
        (version) => version.coreWorkflowId === coreWorkflowId,
      );

      const versions = versionsInCreationOrder
        .map((version, index) => ({
          id: version.id,
          coreWorkflowId: version.coreWorkflowId,
          label: buildCoreWorkflowVersionLabel(index + 1),
          status: version.status,
          workspaceWorkflowVersionId: version.workspaceWorkflowVersionId,
          workspaceWorkflowId: workflow.workspaceWorkflowId,
          trigger: version.triggers?.[0] ?? null,
          steps: version.steps ?? null,
          createdAt: version.createdAt.toISOString(),
          updatedAt: version.updatedAt.toISOString(),
        }))
        .reverse();

      const currentVersion =
        versions.find(
          (version) => version.status === WorkflowVersionStatus.DRAFT,
        ) ??
        versions.find(
          (version) => version.status === WorkflowVersionStatus.ACTIVE,
        ) ??
        versions[0];

      if (currentVersion === undefined) {
        return [];
      }

      return [
        {
          workflow: {
            id: workflow.id,
            name: workflow.name,
            statuses: computeCoreWorkflowStatuses({
              hasDraftVersion: versions.some(
                (version) => version.status === WorkflowVersionStatus.DRAFT,
              ),
              hasActiveVersion: versions.some(
                (version) => version.status === WorkflowVersionStatus.ACTIVE,
              ),
              hasDeactivatedVersion: versions.some(
                (version) =>
                  version.status === WorkflowVersionStatus.DEACTIVATED,
              ),
            }),
            lastPublishedVersionId: workflow.lastPublishedVersionId,
            lastPublishedCoreWorkflowVersionId:
              workflow.lastPublishedCoreWorkflowVersionId,
            applicationId: workflow.applicationId,
            workspaceWorkflowId: workflow.workspaceWorkflowId,
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString(),
          },
          versions,
          currentVersion,
        },
      ];
    });
  }
}
