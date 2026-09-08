import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CoreWorkflowMutationWorkspaceService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async createWorkflow(
    workspaceId: string,
    user: AuthContextUser,
    { name }: { name?: string },
  ): Promise<CoreWorkflowDTO> {
    const applicationId =
      await this.workflowCoreSyncService.getCustomApplicationIdOrThrow(
        workspaceId,
      );

    const authContext = buildSystemAuthContext(workspaceId);

    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.findOneOrFail({
          where: { userId: user.id },
        });
      }, authContext);

    const coreWorkflow = await this.coreWorkflowRepository.insertAndReturnOne(
      workspaceId,
      {
        id: uuidv4(),
        name: name ?? null,
        universalIdentifier: uuidv4(),
        applicationId,
      },
    );

    let workspaceWorkflowId: string | undefined;

    try {
      workspaceWorkflowId =
        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workflowRepository =
            this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          const position = await this.recordPositionService.buildRecordPosition(
            {
              value: 'first',
              objectMetadata: {
                isCustom: false,
                nameSingular: 'workflow',
              },
              workspaceId,
            },
          );

          const insertWorkflowResult = await workflowRepository.insert({
            name: name ?? null,
            position,
            coreWorkflowId: coreWorkflow.id,
            createdBy: buildCreatedByFromFullNameMetadata({
              fullNameMetadata: {
                firstName: workspaceMember.name.firstName,
                lastName: workspaceMember.name.lastName,
              },
              workspaceMemberId: workspaceMember.id,
            }),
          });

          return (
            insertWorkflowResult.generatedMaps[0] as WorkflowWorkspaceEntity
          ).id;
        }, authContext);

      await this.workflowVersionCoreSyncService.createInitialDraftVersionForWorkflow(
        workspaceId,
        workspaceWorkflowId,
      );
    } catch (error) {
      await this.rollbackCreatedWorkflow(
        workspaceId,
        coreWorkflow.id,
        workspaceWorkflowId,
      );

      throw error;
    }

    return {
      id: coreWorkflow.id,
      name: coreWorkflow.name,
      statuses: [WorkflowStatus.DRAFT],
      applicationId,
      workspaceWorkflowId,
      updatedAt: coreWorkflow.updatedAt.toISOString(),
    };
  }

  async deleteWorkflows(
    workspaceId: string,
    { coreWorkflowIds }: { coreWorkflowIds: string[] },
  ): Promise<DeletedCoreWorkflowDTO[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    const workflowsToDelete =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.find({
          where: { coreWorkflowId: In(coreWorkflowIds) },
        });
      }, authContext);

    if (workflowsToDelete.length > 0) {
      const workflowIds = workflowsToDelete.map((workflow) => workflow.id);

      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        await workflowRepository.softDelete({ id: In(workflowIds) });
      }, authContext);

      await this.workflowCommonWorkspaceService.handleWorkflowSubEntities({
        workflowIds,
        workspaceId,
        operation: 'delete',
      });
    }

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      coreWorkflowIds,
    );

    return workflowsToDelete
      .map((workflow) =>
        isDefined(workflow.coreWorkflowId)
          ? { id: workflow.coreWorkflowId, workspaceWorkflowId: workflow.id }
          : undefined,
      )
      .filter(isDefined);
  }

  private async rollbackCreatedWorkflow(
    workspaceId: string,
    coreWorkflowId: string,
    workspaceWorkflowId: string | undefined,
  ): Promise<void> {
    await this.workflowCoreSyncService.deleteFromCore(workspaceId, [
      coreWorkflowId,
    ]);

    if (!isDefined(workspaceWorkflowId)) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );

      await workflowRepository.delete({ id: workspaceWorkflowId });
    }, buildSystemAuthContext(workspaceId));
  }
}
