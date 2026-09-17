import { Injectable, Logger } from '@nestjs/common';

import { In, IsNull, Not } from 'typeorm';
import { msg } from '@lingui/core/macro';
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
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type DiscardDraftVersionOutcome =
  | { status: 'versionNotFound' }
  | { status: 'alreadyDiscarded' }
  | { status: 'discarded'; workflowId: string };

@Injectable()
export class CoreWorkflowMutationWorkspaceService {
  private readonly logger = new Logger(
    CoreWorkflowMutationWorkspaceService.name,
  );

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

    const workspaceWorkflowId = uuidv4();

    const coreWorkflow = await this.coreWorkflowRepository.insertAndReturnOne(
      workspaceId,
      {
        id: uuidv4(),
        name: name ?? null,
        universalIdentifier: uuidv4(),
        applicationId,
        workspaceWorkflowId,
      },
    );

    try {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        const position = await this.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'workflow',
          },
          workspaceId,
        });

        await workflowRepository.insert({
          id: workspaceWorkflowId,
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
      }, authContext);

      await this.workflowVersionCoreSyncService.createInitialDraftVersionForWorkflow(
        workspaceId,
        workspaceWorkflowId,
      );
    } catch (error) {
      try {
        await this.rollbackCreatedWorkflow(
          workspaceId,
          coreWorkflow.id,
          workspaceWorkflowId,
        );
      } catch (rollbackError) {
        this.logger.error(rollbackError);
      }

      throw error;
    }

    return {
      id: coreWorkflow.id,
      name: coreWorkflow.name,
      statuses: [WorkflowStatus.DRAFT],
      lastPublishedVersionId: null,
      applicationId,
      workspaceWorkflowId,
      createdAt: coreWorkflow.createdAt.toISOString(),
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
          withDeleted: true,
        });
      }, authContext);

    const liveWorkflowsToDelete = workflowsToDelete.filter(
      (workflow) => !isDefined(workflow.deletedAt),
    );

    if (workflowsToDelete.length > 0) {
      if (liveWorkflowsToDelete.length > 0) {
        await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const workflowRepository =
            this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
              'workflow',
              { shouldBypassPermissionChecks: true },
            );

          await workflowRepository.softDelete({
            id: In(liveWorkflowsToDelete.map((workflow) => workflow.id)),
          });
        }, authContext);
      }

      await this.workflowCommonWorkspaceService.handleWorkflowSubEntities({
        workflowIds: workflowsToDelete.map((workflow) => workflow.id),
        workspaceId,
        operation: 'delete',
      });
    }

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      coreWorkflowIds,
    );

    return liveWorkflowsToDelete
      .map((workflow) =>
        isDefined(workflow.coreWorkflowId)
          ? { id: workflow.coreWorkflowId, workspaceWorkflowId: workflow.id }
          : undefined,
      )
      .filter(isDefined);
  }

  async discardDraftVersion(
    workspaceId: string,
    { workspaceWorkflowVersionId }: { workspaceWorkflowVersionId: string },
  ): Promise<string | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    const outcome: DiscardDraftVersionOutcome =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersionRepository =
          this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const version = await workflowVersionRepository.findOne({
          where: { id: workspaceWorkflowVersionId },
          withDeleted: true,
        });

        if (!isDefined(version)) {
          return { status: 'versionNotFound' };
        }

        if (isDefined(version.deletedAt)) {
          return { status: 'alreadyDiscarded' };
        }

        assertWorkflowVersionIsDraft(version);

        const otherLiveVersionsExist = await workflowVersionRepository.exists({
          where: {
            workflowId: version.workflowId,
            deletedAt: IsNull(),
            id: Not(workspaceWorkflowVersionId),
          },
        });

        if (!otherLiveVersionsExist) {
          throw new WorkflowQueryValidationException(
            'The initial version of a workflow can not be deleted',
            WorkflowQueryValidationExceptionCode.FORBIDDEN,
            {
              userFriendlyMessage: msg`The initial version of a workflow can not be deleted`,
            },
          );
        }

        const softDeleteResult = await workflowVersionRepository.softDelete({
          id: workspaceWorkflowVersionId,
          status: WorkflowVersionStatus.DRAFT,
        });

        if (softDeleteResult.affected === 0) {
          throw new WorkflowQueryValidationException(
            'Workflow version is not in draft status',
            WorkflowQueryValidationExceptionCode.FORBIDDEN,
            {
              userFriendlyMessage: msg`Workflow version is not in draft status`,
            },
          );
        }

        return { status: 'discarded', workflowId: version.workflowId };
      }, authContext);

    if (outcome.status === 'versionNotFound') {
      return null;
    }

    await this.workflowVersionCoreSyncService.deleteCoreVersionsByWorkspaceVersionIds(
      workspaceId,
      [workspaceWorkflowVersionId],
    );

    if (outcome.status === 'alreadyDiscarded') {
      return null;
    }

    return outcome.workflowId;
  }

  private async rollbackCreatedWorkflow(
    workspaceId: string,
    coreWorkflowId: string,
    workspaceWorkflowId: string | undefined,
  ): Promise<void> {
    if (isDefined(workspaceWorkflowId)) {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowVersionRepository =
          this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        await workflowVersionRepository.delete({
          workflowId: workspaceWorkflowId,
        });

        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        await workflowRepository.delete({ id: workspaceWorkflowId });
      }, buildSystemAuthContext(workspaceId));
    }

    await this.workflowCoreSyncService.deleteFromCore(workspaceId, [
      coreWorkflowId,
    ]);

    if (isDefined(workspaceWorkflowId)) {
      await this.workflowVersionCoreSyncService.deleteCoreVersionsByWorkflowIds(
        workspaceId,
        [workspaceWorkflowId],
      );
    }
  }
}
