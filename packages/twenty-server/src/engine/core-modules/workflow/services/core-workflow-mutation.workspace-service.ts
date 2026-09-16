import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { v4 as uuidv4 } from 'uuid';

import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { type DiscardCoreWorkflowDraftInput } from 'src/engine/core-modules/workflow/dtos/discard-core-workflow-draft.input';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
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
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async duplicateWorkflow({
    workspaceId,
    user,
    coreWorkflowIdToDuplicate,
    coreWorkflowVersionIdToCopy,
  }: {
    workspaceId: string;
    user: AuthContextUser;
    coreWorkflowIdToDuplicate: string;
    coreWorkflowVersionIdToCopy: string;
  }): Promise<CoreWorkflowDTO> {
    const { coreWorkflow: sourceCoreWorkflow } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId: coreWorkflowIdToDuplicate },
      );

    const sourceVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      {
        where: {
          id: coreWorkflowVersionIdToCopy,
          coreWorkflowId: coreWorkflowIdToDuplicate,
        },
      },
    );

    const sourceTrigger = sourceVersion?.triggers?.[0];

    if (!isDefined(sourceVersion) || !isDefined(sourceTrigger)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreWorkflowVersionIdToCopy}' to copy not found or has no trigger`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version to copy not found`,
        },
      );
    }

    const { trigger: remappedTrigger, steps: remappedSteps } =
      await this.cloneVersionContent({
        workspaceId,
        trigger: sourceTrigger,
        steps: sourceVersion.steps ?? [],
      });

    const duplicatedWorkflow = await this.createWorkflow(workspaceId, user, {
      name: `${sourceCoreWorkflow.name ?? ''} (Duplicate)`,
    });

    const initialDraft = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      {
        where: {
          coreWorkflowId: duplicatedWorkflow.id,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      },
    );

    if (!isDefined(initialDraft)) {
      throw new WorkflowQueryValidationException(
        `Duplicated core workflow '${duplicatedWorkflow.id}' has no initial draft version`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow duplication failed, please retry`,
        },
      );
    }

    const { workspaceWorkflowVersionId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId: initialDraft.id },
      );

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId: initialDraft.id,
      workspaceWorkflowVersionId,
      trigger: remappedTrigger,
      steps: remappedSteps,
    });

    const duplicatedCoreWorkflow =
      await this.coreWorkflowListService.findOneById({
        workspaceId,
        coreWorkflowId: duplicatedWorkflow.id,
      });

    if (!isDefined(duplicatedCoreWorkflow)) {
      throw new WorkflowQueryValidationException(
        `Core row '${duplicatedWorkflow.id}' of the duplicated workflow not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow duplication failed, please retry`,
        },
      );
    }

    return duplicatedCoreWorkflow;
  }

  private async cloneVersionContent({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: NonNullable<WorkflowVersionEntity['triggers']>[number];
    steps: WorkflowAction[];
  }) {
    const sourceToClonedPairs: Array<{
      source: WorkflowAction;
      duplicated: WorkflowAction;
    }> = [];
    const oldToNewIdMap = new Map<string, string>();

    for (const step of steps) {
      const clonedStep =
        await this.workflowVersionStepOperationsWorkspaceService.cloneStep({
          step,
          workspaceId,
        });

      sourceToClonedPairs.push({ source: step, duplicated: clonedStep });
      oldToNewIdMap.set(step.id, clonedStep.id);
    }

    const remappedTrigger = {
      ...trigger,
      nextStepIds: (trigger.nextStepIds ?? []).map(
        (oldId) => oldToNewIdMap.get(oldId) ?? oldId,
      ),
    };

    const remappedSteps: WorkflowAction[] = sourceToClonedPairs.map(
      ({ source, duplicated }) => {
        const remappedStep = {
          ...duplicated,
          nextStepIds: (source.nextStepIds ?? []).map(
            (oldId) => oldToNewIdMap.get(oldId) ?? oldId,
          ),
        };

        if (
          source.type === WorkflowActionType.ITERATOR &&
          isDefined(source.settings?.input?.initialLoopStepIds)
        ) {
          remappedStep.settings = {
            ...remappedStep.settings,
            input: {
              ...remappedStep.settings.input,
              initialLoopStepIds: source.settings.input.initialLoopStepIds.map(
                (oldId: string) => oldToNewIdMap.get(oldId) ?? oldId,
              ),
            },
          };
        }

        return remappedStep;
      },
    );

    return { trigger: remappedTrigger, steps: remappedSteps };
  }

  async updateWorkflow(
    workspaceId: string,
    { coreWorkflowId, name }: { coreWorkflowId: string; name: string },
  ): Promise<void> {
    const { workspaceWorkflowId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId },
      );

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await transactionScope.executeRawQuery(
            `UPDATE core."workflow" SET "name" = $1, "updatedAt" = now() WHERE "id" = $2 AND "workspaceId" = $3`,
            [name, coreWorkflowId, workspaceId],
          );

          await transactionScope
            .getRepository<WorkflowWorkspaceEntity>('workflow', {
              shouldBypassPermissionChecks: true,
            })
            .update({ id: workspaceWorkflowId }, { name });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.workflowCommonWorkspaceService.syncCommandMenuItemLabelForWorkflows(
      [workspaceWorkflowId],
      buildSystemAuthContext(workspaceId),
    );
  }

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
    {
      workspaceWorkflowVersionId,
      coreWorkflowVersionId,
    }: DiscardCoreWorkflowDraftInput,
  ): Promise<string | null> {
    if (
      isDefined(workspaceWorkflowVersionId) &&
      isDefined(coreWorkflowVersionId)
    ) {
      throw new WorkflowQueryValidationException(
        'Only one of workspaceWorkflowVersionId or coreWorkflowVersionId may be provided',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Only one workflow version identifier may be provided`,
        },
      );
    }

    const resolvedCoreVersionId = await this.resolveDiscardTargetCoreVersionId(
      workspaceId,
      { workspaceWorkflowVersionId, coreWorkflowVersionId },
    );

    if (!isDefined(resolvedCoreVersionId)) {
      return null;
    }

    const coreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { id: resolvedCoreVersionId } },
    );

    if (!isDefined(coreVersion)) {
      return null;
    }

    if (coreVersion.status !== CoreWorkflowVersionStatus.DRAFT) {
      throw new WorkflowQueryValidationException(
        'Workflow version is not in draft status',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version is not in draft status`,
        },
      );
    }

    if (!isDefined(coreVersion.coreWorkflowId)) {
      throw new WorkflowQueryValidationException(
        `Core workflow version '${coreVersion.id}' is not linked to a core workflow`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version is not correctly linked to its workflow`,
        },
      );
    }

    const siblingCount = await this.coreWorkflowVersionRepository.count(
      workspaceId,
      { where: { coreWorkflowId: coreVersion.coreWorkflowId } },
    );

    if (siblingCount <= 1) {
      throw new WorkflowQueryValidationException(
        'The initial version of a workflow can not be deleted',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`The initial version of a workflow can not be deleted`,
        },
      );
    }

    const { workspaceWorkflowVersionId: workspaceTwinId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceVersionIdOrThrow(
        { workspaceId, coreWorkflowVersionId: coreVersion.id },
      );

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          await transactionScope.executeRawQuery(
            `DELETE FROM core."workflowVersion" WHERE "id" = $1 AND "workspaceId" = $2`,
            [coreVersion.id, workspaceId],
          );

          await transactionScope
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .softDelete({ id: workspaceTwinId });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return coreVersion.coreWorkflowId;
  }

  private async resolveDiscardTargetCoreVersionId(
    workspaceId: string,
    {
      workspaceWorkflowVersionId,
      coreWorkflowVersionId,
    }: DiscardCoreWorkflowDraftInput,
  ): Promise<string | null> {
    if (isDefined(coreWorkflowVersionId)) {
      return coreWorkflowVersionId;
    }

    if (!isDefined(workspaceWorkflowVersionId)) {
      throw new WorkflowQueryValidationException(
        'Either workspaceWorkflowVersionId or coreWorkflowVersionId must be provided',
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow version is missing from the request`,
        },
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const workspaceVersion = await workflowVersionRepository.findOne({
        where: { id: workspaceWorkflowVersionId },
        withDeleted: true,
      });

      if (
        !isDefined(workspaceVersion) ||
        isDefined(workspaceVersion.deletedAt)
      ) {
        return null;
      }

      if (!isDefined(workspaceVersion.coreWorkflowVersionId)) {
        throw new WorkflowQueryValidationException(
          `Workspace version '${workspaceWorkflowVersionId}' has no core twin`,
          WorkflowQueryValidationExceptionCode.FORBIDDEN,
          {
            userFriendlyMessage: msg`Workflow version is not correctly linked to its mirror`,
          },
        );
      }

      return workspaceVersion.coreWorkflowVersionId;
    }, buildSystemAuthContext(workspaceId));
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
