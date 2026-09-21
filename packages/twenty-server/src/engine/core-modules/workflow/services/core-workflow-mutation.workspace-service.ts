import { Injectable, Logger } from '@nestjs/common';

import { In } from 'typeorm';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
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
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { assertExactlyOneMirrorRowWasWritten } from 'src/engine/core-modules/workflow/utils/assert-exactly-one-mirror-row-was-written.util';
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
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CoreWorkflowMigrationWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-migration-write.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { remapDuplicatedStepDestinations } from 'src/modules/workflow/workflow-builder/utils/remap-duplicated-step-destinations.util';
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
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly coreWorkflowMigrationWriteService: CoreWorkflowMigrationWriteService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
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

    try {
      return await this.writeDuplicatedContentAndReturn({
        workspaceId,
        duplicatedCoreWorkflowId: duplicatedWorkflow.id,
        trigger: remappedTrigger,
        steps: remappedSteps,
      });
    } catch (error) {
      try {
        await this.deleteWorkflows(workspaceId, {
          coreWorkflowIds: [duplicatedWorkflow.id],
        });
      } catch (cleanupError) {
        this.logger.error(cleanupError);
      }

      throw error;
    }
  }

  private async writeDuplicatedContentAndReturn({
    workspaceId,
    duplicatedCoreWorkflowId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    duplicatedCoreWorkflowId: string;
    trigger: NonNullable<WorkflowVersionEntity['triggers']>[number];
    steps: WorkflowAction[];
  }): Promise<CoreWorkflowDTO> {
    const initialDraft = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      {
        where: {
          coreWorkflowId: duplicatedCoreWorkflowId,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      },
    );

    if (!isDefined(initialDraft)) {
      throw new WorkflowQueryValidationException(
        `Duplicated core workflow '${duplicatedCoreWorkflowId}' has no initial draft version`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Workflow duplication failed, please retry`,
        },
      );
    }

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId: initialDraft.id,
      trigger,
      steps,
    });

    const duplicatedCoreWorkflow =
      await this.coreWorkflowListService.findOneById({
        workspaceId,
        coreWorkflowId: duplicatedCoreWorkflowId,
      });

    if (!isDefined(duplicatedCoreWorkflow)) {
      throw new WorkflowQueryValidationException(
        `Core row '${duplicatedCoreWorkflowId}' of the duplicated workflow not found`,
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
    const sourceToClonedPairs: {
      source: WorkflowAction;
      duplicated: WorkflowAction;
    }[] = [];
    const clonedStepIdBySourceStepId = new Map<string, string>();

    for (const step of steps) {
      const clonedStep =
        await this.workflowVersionStepOperationsWorkspaceService.cloneStep({
          step,
          workspaceId,
        });

      sourceToClonedPairs.push({ source: step, duplicated: clonedStep });
      clonedStepIdBySourceStepId.set(step.id, clonedStep.id);
    }

    return remapDuplicatedStepDestinations({
      trigger,
      sourceToClonedPairs,
      clonedStepIdBySourceStepId,
    });
  }

  async updateWorkflow(
    workspaceId: string,
    { coreWorkflowId, name }: { coreWorkflowId: string; name: string },
  ): Promise<void> {
    const { workspaceWorkflowId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId },
      );

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const flatWorkflow = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    });

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while renaming workflow',
      operations: {
        workflow: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [{ ...flatWorkflow, name }],
        },
      },
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager
        .getRepository<WorkflowWorkspaceEntity>('workflow', {
          shouldBypassPermissionChecks: true,
        })
        .update({ id: workspaceWorkflowId }, { name });
    }, buildSystemAuthContext(workspaceId));

    await this.syncCommandMenuItemLabelFromCore({
      workspaceId,
      coreWorkflowId,
      name,
    });
  }

  private async syncCommandMenuItemLabelFromCore({
    workspaceId,
    coreWorkflowId,
    name,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    name: string;
  }): Promise<void> {
    const coreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      {
        where: { id: coreWorkflowId },
        select: { id: true, lastPublishedCoreWorkflowVersionId: true },
      },
    );

    const publishedCoreVersionId =
      coreWorkflow?.lastPublishedCoreWorkflowVersionId;

    if (!isDefined(publishedCoreVersionId)) {
      return;
    }

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByCoreWorkflowVersionId(
        publishedCoreVersionId,
        workspaceId,
      );

    if (!isDefined(existingCommandMenuItem)) {
      return;
    }

    const label = getWorkflowCommandMenuItemLabel({ name });

    if (
      existingCommandMenuItem.label === label &&
      existingCommandMenuItem.shortLabel === label
    ) {
      return;
    }

    await this.commandMenuItemService.update(
      { id: existingCommandMenuItem.id, label, shortLabel: label },
      workspaceId,
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

    const createdAt = new Date().toISOString();

    const coreWorkflow = {
      id: uuidv4(),
      name: name ?? null,
      universalIdentifier: uuidv4(),
      workspaceWorkflowId,
      lastPublishedVersionId: null,
      lastPublishedCoreWorkflowVersionId: null,
    };

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.coreWorkflowMigrationWriteService.run({
      workspaceId,
      failureMessage:
        'Multiple validation errors occurred while creating workflow',
      operations: {
        workflow: {
          flatEntityToCreate: [
            {
              ...coreWorkflow,
              applicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              createdAt,
              updatedAt: createdAt,
            },
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });

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
      createdAt,
      updatedAt: createdAt,
    };
  }

  async deleteWorkflows(
    workspaceId: string,
    { coreWorkflowIds }: { coreWorkflowIds: string[] },
  ): Promise<DeletedCoreWorkflowDTO[]> {
    const coreWorkflowsToDelete = await this.coreWorkflowRepository.find(
      workspaceId,
      {
        where: { id: In(coreWorkflowIds) },
        select: { id: true, workspaceWorkflowId: true },
      },
    );

    const deletedCoreWorkflows = coreWorkflowsToDelete
      .map(({ id, workspaceWorkflowId }) =>
        isDefined(workspaceWorkflowId)
          ? { id, workspaceWorkflowId }
          : undefined,
      )
      .filter(isDefined);

    const mirrorWorkflowIds = await this.findMirrorWorkflowIdsToDelete({
      workspaceId,
      coreWorkflowIds,
      knownMirrorWorkflowIds: deletedCoreWorkflows.map(
        ({ workspaceWorkflowId }) => workspaceWorkflowId,
      ),
    });

    if (mirrorWorkflowIds.length > 0) {
      const authContext = buildSystemAuthContext(workspaceId);

      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        await this.workspaceOrmManager
          .getRepository<WorkflowWorkspaceEntity>('workflow', {
            shouldBypassPermissionChecks: true,
          })
          .softDelete({ id: In(mirrorWorkflowIds) });
      }, authContext);

      await this.workflowCommonWorkspaceService.handleWorkflowSubEntities({
        workflowIds: mirrorWorkflowIds,
        workspaceId,
        operation: 'delete',
      });
    }

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      coreWorkflowIds,
    );

    return deletedCoreWorkflows;
  }

  private async findMirrorWorkflowIdsToDelete({
    workspaceId,
    coreWorkflowIds,
    knownMirrorWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
    knownMirrorWorkflowIds: string[];
  }): Promise<string[]> {
    const mirrorWorkflows =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<WorkflowWorkspaceEntity>('workflow', {
              shouldBypassPermissionChecks: true,
            })
            .find({
              where: { coreWorkflowId: In(coreWorkflowIds) },
              select: { id: true },
              withDeleted: true,
            }),
        buildSystemAuthContext(workspaceId),
      );

    return [
      ...new Set([
        ...knownMirrorWorkflowIds,
        ...mirrorWorkflows.map(({ id }) => id),
      ]),
    ];
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

    const discardedCoreWorkflowId = coreVersion.coreWorkflowId;

    const siblingCount = await this.coreWorkflowVersionRepository.count(
      workspaceId,
      { where: { coreWorkflowId: discardedCoreWorkflowId } },
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

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const flatCoreVersionToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: coreVersion.id,
      flatEntityMaps: flatWorkflowVersionMaps,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const mirrorDeleteResult = await transactionScope
            .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
              shouldBypassPermissionChecks: true,
            })
            .softDelete({ coreWorkflowVersionId: coreVersion.id });

          assertExactlyOneMirrorRowWasWritten({
            affected: mirrorDeleteResult.affected,
            coreWorkflowVersionId: coreVersion.id,
          });
        },
      );
    }, buildSystemAuthContext(workspaceId));

    try {
      await this.coreWorkflowMigrationWriteService.run({
        workspaceId,
        failureMessage:
          'Multiple validation errors occurred while discarding workflow draft',
        operations: {
          workflowVersion: {
            flatEntityToCreate: [],
            flatEntityToDelete: [flatCoreVersionToDelete],
            flatEntityToUpdate: [],
          },
        },
      });
    } catch (error) {
      // The mirror soft-delete is already committed, so leaving it deleted next
      // to a live core row is drift the user cannot see or undo.
      await this.restoreDiscardedMirrorVersion({
        workspaceId,
        coreWorkflowVersionId: coreVersion.id,
      });

      throw error;
    }

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return coreVersion.coreWorkflowId;
  }

  private async restoreDiscardedMirrorVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<void> {
    try {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        await this.workspaceOrmManager
          .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
            shouldBypassPermissionChecks: true,
          })
          .restore({ coreWorkflowVersionId });
      }, buildSystemAuthContext(workspaceId));
    } catch (restoreError) {
      this.logger.error(
        `Failed to restore the mirror version for core version ${coreWorkflowVersionId} in workspace ${workspaceId}: ${restoreError}`,
      );
    }
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
