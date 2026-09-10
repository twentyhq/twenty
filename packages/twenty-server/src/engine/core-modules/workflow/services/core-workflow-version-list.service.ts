import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class CoreWorkflowVersionListService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findManyByWorkspaceWorkflowId({
    workspaceId,
    workspaceWorkflowId,
  }: {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workflowId: workspaceWorkflowId },
        order: { createdAt: 'ASC', id: 'ASC' },
        select: { id: true, status: true, createdAt: true },
      },
    );

    const workspaceVersionIdByCoreVersionId =
      await this.findWorkspaceVersionIdByCoreVersionId({
        workspaceId,
        workspaceWorkflowId,
        coreWorkflowVersionIds: coreWorkflowVersions.map(
          (coreWorkflowVersion) => coreWorkflowVersion.id,
        ),
      });

    return coreWorkflowVersions
      .map((coreWorkflowVersion, index) => ({
        id: coreWorkflowVersion.id,
        label: buildCoreWorkflowVersionLabel(index + 1),
        status: coreWorkflowVersion.status,
        workspaceWorkflowVersionId:
          workspaceVersionIdByCoreVersionId[coreWorkflowVersion.id] ?? null,
        workspaceWorkflowId,
        trigger: null,
        steps: null,
        createdAt: coreWorkflowVersion.createdAt.toISOString(),
      }))
      .reverse();
  }

  async findOneByWorkspaceWorkflowVersionId({
    workspaceId,
    workspaceWorkflowVersionId,
  }: {
    workspaceId: string;
    workspaceWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    const workspaceWorkflowVersion =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({
              where: { id: workspaceWorkflowVersionId },
              select: { id: true, workflowId: true },
            }),
        authContext,
      );

    if (!isDefined(workspaceWorkflowVersion)) {
      return null;
    }

    const coreWorkflowVersions = await this.findManyByWorkspaceWorkflowId({
      workspaceId,
      workspaceWorkflowId: workspaceWorkflowVersion.workflowId,
    });

    const coreWorkflowVersionMetadata = coreWorkflowVersions.find(
      (coreWorkflowVersion) =>
        coreWorkflowVersion.workspaceWorkflowVersionId ===
        workspaceWorkflowVersionId,
    );

    if (!isDefined(coreWorkflowVersionMetadata)) {
      return null;
    }

    const coreWorkflowVersionContent =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionMetadata.id },
        select: { id: true, triggers: true, steps: true },
      });

    return {
      ...coreWorkflowVersionMetadata,
      trigger: coreWorkflowVersionContent?.triggers?.[0] ?? null,
      steps: coreWorkflowVersionContent?.steps ?? null,
    };
  }

  private async findWorkspaceVersionIdByCoreVersionId({
    workspaceId,
    workspaceWorkflowId,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    workspaceWorkflowId: string;
    coreWorkflowVersionIds: string[];
  }): Promise<Record<string, string>> {
    if (coreWorkflowVersionIds.length === 0) {
      return {};
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceWorkflowVersions = await this.workspaceOrmManager
        .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
          shouldBypassPermissionChecks: true,
        })
        .find({
          where: {
            workflowId: workspaceWorkflowId,
            coreWorkflowVersionId: In(coreWorkflowVersionIds),
          },
          select: { id: true, coreWorkflowVersionId: true },
        });

      return Object.fromEntries(
        workspaceWorkflowVersions.flatMap((workspaceWorkflowVersion) =>
          isDefined(workspaceWorkflowVersion.coreWorkflowVersionId)
            ? [
                [
                  workspaceWorkflowVersion.coreWorkflowVersionId,
                  workspaceWorkflowVersion.id,
                ],
              ]
            : [],
        ),
      );
    }, authContext);
  }
}
