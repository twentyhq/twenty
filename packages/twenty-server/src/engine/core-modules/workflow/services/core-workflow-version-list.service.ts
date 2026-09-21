import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class CoreWorkflowVersionListService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
  ) {}

  async findManyByWorkspaceWorkflowId({
    workspaceId,
    userWorkspaceId,
    workspaceWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowId: string;
  }): Promise<CoreWorkflowVersionDTO[]> {
    const parentCoreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      { where: { workspaceWorkflowId }, select: { id: true } },
    );

    if (
      isDefined(parentCoreWorkflow) &&
      !(await this.coreWorkflowAccessService.isCoreWorkflowAccessible({
        workspaceId,
        userWorkspaceId,
        coreWorkflowId: parentCoreWorkflow.id,
      }))
    ) {
      return [];
    }

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { workflowId: workspaceWorkflowId },
        order: { createdAt: 'ASC', id: 'ASC' },
        select: {
          id: true,
          coreWorkflowId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          workspaceWorkflowVersionId: true,
        },
      },
    );

    return coreWorkflowVersions
      .map((coreWorkflowVersion, index) => ({
        id: coreWorkflowVersion.id,
        coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
        label: buildCoreWorkflowVersionLabel(index + 1),
        status: coreWorkflowVersion.status,
        workspaceWorkflowVersionId:
          coreWorkflowVersion.workspaceWorkflowVersionId,
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
    userWorkspaceId,
    workspaceWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    workspaceWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { workspaceWorkflowVersionId },
        select: { id: true },
      });

    if (!isDefined(coreWorkflowVersion)) {
      return null;
    }

    return this.findOneByCoreWorkflowVersionId({
      workspaceId,
      userWorkspaceId,
      coreWorkflowVersionId: coreWorkflowVersion.id,
    });
  }

  async findManyByCoreWorkflowId({
    workspaceId,
    userWorkspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
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

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreAccessibleOrThrow(
      { workspaceId, userWorkspaceId, coreWorkflowIds: [coreWorkflowId] },
    );

    const coreWorkflowVersions = await this.coreWorkflowVersionRepository.find(
      workspaceId,
      {
        where: { coreWorkflowId },
        order: { createdAt: 'ASC', id: 'ASC' },
        select: {
          id: true,
          coreWorkflowId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          workspaceWorkflowVersionId: true,
        },
      },
    );

    return coreWorkflowVersions
      .map((coreWorkflowVersion, index) => ({
        id: coreWorkflowVersion.id,
        coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
        label: buildCoreWorkflowVersionLabel(index + 1),
        status: coreWorkflowVersion.status,
        workspaceWorkflowVersionId:
          coreWorkflowVersion.workspaceWorkflowVersionId,
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
    userWorkspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    coreWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO | null> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionRepository.findOne(workspaceId, {
        where: { id: coreWorkflowVersionId },
      });

    if (!isDefined(coreWorkflowVersion?.coreWorkflowId)) {
      return null;
    }

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreAccessibleOrThrow(
      {
        workspaceId,
        userWorkspaceId,
        coreWorkflowIds: [coreWorkflowVersion.coreWorkflowId],
      },
    );

    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      {
        where: { id: coreWorkflowVersion.coreWorkflowId },
        select: { id: true, workspaceWorkflowId: true },
      },
    );

    const versionRank = await this.computeCoreWorkflowVersionRank({
      workspaceId,
      coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
      coreWorkflowVersionId: coreWorkflowVersion.id,
    });

    return {
      id: coreWorkflowVersion.id,
      coreWorkflowId: coreWorkflowVersion.coreWorkflowId,
      label: buildCoreWorkflowVersionLabel(versionRank),
      status: coreWorkflowVersion.status,
      workspaceWorkflowVersionId:
        coreWorkflowVersion.workspaceWorkflowVersionId,
      workspaceWorkflowId: coreWorkflow?.workspaceWorkflowId ?? null,
      trigger: coreWorkflowVersion.triggers?.[0] ?? null,
      steps: coreWorkflowVersion.steps ?? null,
      createdAt: coreWorkflowVersion.createdAt.toISOString(),
      updatedAt: coreWorkflowVersion.updatedAt.toISOString(),
    };
  }

  private async computeCoreWorkflowVersionRank({
    workspaceId,
    coreWorkflowId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
  }): Promise<number> {
    const [{ rank }]: [{ rank: number }] = await this.coreDataSource.query(
      `SELECT count(*)::int AS "rank"
       FROM core."workflowVersion" sibling
       JOIN core."workflowVersion" target
         ON target."id" = $2 AND target."workspaceId" = $1
       WHERE sibling."coreWorkflowId" = $3
         AND sibling."workspaceId" = $1
         AND (sibling."createdAt", sibling."id") <= (target."createdAt", target."id")`,
      [workspaceId, coreWorkflowVersionId, coreWorkflowId],
    );

    return rank;
  }
}
