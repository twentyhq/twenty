import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { Equal, In, LessThan, LessThanOrEqual } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
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
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
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
        select: { id: true, status: true, createdAt: true, updatedAt: true },
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
        updatedAt: coreWorkflowVersion.updatedAt.toISOString(),
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

  async findManyByCoreWorkflowId({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      {
        where: { id: coreWorkflowId },
        select: { id: true, workspaceWorkflowId: true },
      },
    );

    if (!isDefined(coreWorkflow)) {
      return [];
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { coreWorkflowId },
        order: { createdAt: 'ASC', id: 'ASC' },
        select: { id: true, status: true, createdAt: true, updatedAt: true },
      },
    );

    const workspaceVersionIdByCoreVersionId = isDefined(
      coreWorkflow.workspaceWorkflowId,
    )
      ? await this.findWorkspaceVersionIdByCoreVersionId({
          workspaceId,
          workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
          coreWorkflowVersionIds: coreWorkflowVersions.map(
            (coreWorkflowVersion) => coreWorkflowVersion.id,
          ),
        })
      : {};

    return coreWorkflowVersions
      .map((coreWorkflowVersion, index) => ({
        id: coreWorkflowVersion.id,
        label: buildCoreWorkflowVersionLabel(index + 1),
        status: coreWorkflowVersion.status,
        workspaceWorkflowVersionId:
          workspaceVersionIdByCoreVersionId[coreWorkflowVersion.id] ?? null,
        workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
        trigger: null,
        steps: null,
        createdAt: coreWorkflowVersion.createdAt.toISOString(),
        updatedAt: coreWorkflowVersion.updatedAt.toISOString(),
      }))
      .reverse();
  }

  async findOneByCoreWorkflowVersionId({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion?.coreWorkflowId)) {
      return null;
    }

    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      {
        where: { id: coreWorkflowVersion.coreWorkflowId },
        select: { id: true, workspaceWorkflowId: true },
      },
    );

    const olderSiblingsCount = await this.coreWorkflowVersionRepository.count(
      workspaceId,
      {
        where: {
          coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
          createdAt: LessThan(coreWorkflowVersion.createdAt),
        },
      },
    );

    const tiedOlderSiblingsCount =
      await this.coreWorkflowVersionRepository.count(workspaceId, {
        where: {
          coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
          createdAt: Equal(coreWorkflowVersion.createdAt),
          id: LessThanOrEqual(coreWorkflowVersion.id),
        },
      });

    const workspaceWorkflowVersionId =
      await this.findWorkspaceVersionIdForCoreVersionId({
        workspaceId,
        coreWorkflowVersionId,
      });

    return {
      id: coreWorkflowVersion.id,
      label: buildCoreWorkflowVersionLabel(
        olderSiblingsCount + tiedOlderSiblingsCount,
      ),
      status: coreWorkflowVersion.status,
      workspaceWorkflowVersionId,
      workspaceWorkflowId: coreWorkflow?.workspaceWorkflowId ?? null,
      trigger: coreWorkflowVersion.triggers?.[0] ?? null,
      steps: coreWorkflowVersion.steps ?? null,
      createdAt: coreWorkflowVersion.createdAt.toISOString(),
      updatedAt: coreWorkflowVersion.updatedAt.toISOString(),
    };
  }

  private async findWorkspaceVersionIdForCoreVersionId({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceVersion = await this.workspaceOrmManager
        .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
          shouldBypassPermissionChecks: true,
        })
        .findOne({ where: { coreWorkflowVersionId } });

      return workspaceVersion?.id ?? null;
    }, buildSystemAuthContext(workspaceId));
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
