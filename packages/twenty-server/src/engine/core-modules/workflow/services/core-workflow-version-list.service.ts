import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { groupCoreWorkflowVersionsByWorkspaceWorkflowId } from 'src/engine/core-modules/workflow/utils/group-core-workflow-versions-by-workspace-workflow-id.util';
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

  async findManyByWorkspaceWorkflowIds({
    workspaceId,
    workspaceWorkflowIds,
  }: {
    workspaceId: string;
    workspaceWorkflowIds: string[];
  }): Promise<Record<string, CoreWorkflowVersionDTO[]>> {
    if (workspaceWorkflowIds.length === 0) {
      return {};
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workflowId: In(workspaceWorkflowIds) },
        order: { createdAt: 'ASC', id: 'ASC' },
        select: {
          id: true,
          workflowId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    );

    const workspaceVersionIdByCoreVersionId =
      await this.findWorkspaceVersionIdByCoreVersionId({
        workspaceId,
        workspaceWorkflowIds,
        coreWorkflowVersionIds: coreWorkflowVersions.map(
          (coreWorkflowVersion) => coreWorkflowVersion.id,
        ),
      });

    return groupCoreWorkflowVersionsByWorkspaceWorkflowId({
      coreWorkflowVersions,
      workspaceVersionIdByCoreVersionId,
    });
  }

  async findManyByWorkspaceWorkflowId({
    workspaceId,
    workspaceWorkflowId,
  }: {
    workspaceId: string;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const coreWorkflowVersionsByWorkspaceWorkflowId =
      await this.findManyByWorkspaceWorkflowIds({
        workspaceId,
        workspaceWorkflowIds: [workspaceWorkflowId],
      });

    return coreWorkflowVersionsByWorkspaceWorkflowId[workspaceWorkflowId] ?? [];
  }

  async findManyByWorkspaceWorkflowVersionIds({
    workspaceId,
    workspaceWorkflowVersionIds,
  }: {
    workspaceId: string;
    workspaceWorkflowVersionIds: string[];
  }): Promise<CoreWorkflowVersionDTO[]> {
    if (workspaceWorkflowVersionIds.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    const workspaceWorkflowVersions =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .find({
              where: { id: In(workspaceWorkflowVersionIds) },
              select: { id: true, workflowId: true },
            }),
        authContext,
      );

    const coreWorkflowVersionsByWorkspaceWorkflowId =
      await this.findManyByWorkspaceWorkflowIds({
        workspaceId,
        workspaceWorkflowIds: Array.from(
          new Set(
            workspaceWorkflowVersions.map(
              (workspaceWorkflowVersion) => workspaceWorkflowVersion.workflowId,
            ),
          ),
        ),
      });

    const requestedWorkspaceWorkflowVersionIds = new Set(
      workspaceWorkflowVersionIds,
    );

    const coreWorkflowVersionMetadatas = Object.values(
      coreWorkflowVersionsByWorkspaceWorkflowId,
    )
      .flat()
      .filter(
        (coreWorkflowVersion) =>
          isDefined(coreWorkflowVersion.workspaceWorkflowVersionId) &&
          requestedWorkspaceWorkflowVersionIds.has(
            coreWorkflowVersion.workspaceWorkflowVersionId,
          ),
      );

    if (coreWorkflowVersionMetadatas.length === 0) {
      return [];
    }

    const coreWorkflowVersionContents =
      await this.coreWorkflowVersionRepository.find(workspaceId, {
        where: {
          id: In(
            coreWorkflowVersionMetadatas.map(
              (coreWorkflowVersion) => coreWorkflowVersion.id,
            ),
          ),
        },
        select: { id: true, triggers: true, steps: true },
      });

    const coreWorkflowVersionContentById = Object.fromEntries(
      coreWorkflowVersionContents.map((coreWorkflowVersionContent) => [
        coreWorkflowVersionContent.id,
        coreWorkflowVersionContent,
      ]),
    );

    return coreWorkflowVersionMetadatas.map((coreWorkflowVersionMetadata) => ({
      ...coreWorkflowVersionMetadata,
      trigger:
        coreWorkflowVersionContentById[coreWorkflowVersionMetadata.id]
          ?.triggers?.[0] ?? null,
      steps:
        coreWorkflowVersionContentById[coreWorkflowVersionMetadata.id]?.steps ??
        null,
    }));
  }

  async findOneByWorkspaceWorkflowVersionId({
    workspaceId,
    workspaceWorkflowVersionId,
  }: {
    workspaceId: string;
    workspaceWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const [coreWorkflowVersion] =
      await this.findManyByWorkspaceWorkflowVersionIds({
        workspaceId,
        workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
      });

    return coreWorkflowVersion ?? null;
  }

  private async findWorkspaceVersionIdByCoreVersionId({
    workspaceId,
    workspaceWorkflowIds,
    coreWorkflowVersionIds,
  }: {
    workspaceId: string;
    workspaceWorkflowIds: string[];
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
            workflowId: In(workspaceWorkflowIds),
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
