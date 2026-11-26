import { Injectable, Logger } from '@nestjs/common';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getUserWorkspaceIdFromAuthContext } from 'src/engine/core-modules/auth/utils/get-user-workspace-id-from-auth-context.util';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

import { In } from 'typeorm';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type CoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow.dto';
import { type DeletedCoreWorkflowDTO } from 'src/engine/core-modules/workflow/dtos/deleted-core-workflow.dto';
import { type DiscardCoreWorkflowDraftInput } from 'src/engine/core-modules/workflow/dtos/discard-core-workflow-draft.input';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  CoreWorkflowMetadataException,
  CoreWorkflowMetadataExceptionCode,
} from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';
import { CoreWorkflowListService } from 'src/engine/core-modules/workflow/services/core-workflow-list.service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { CoreWorkflowTriggerService } from 'src/engine/core-modules/workflow/services/core-workflow-trigger.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  assembleWorkflowVersionContent,
  type WorkflowVersionEdge,
} from 'src/modules/workflow/workflow-builder/utils/assemble-workflow-version-content.util';
import { remapDuplicatedStepDestinations } from 'src/modules/workflow/workflow-builder/utils/remap-duplicated-step-destinations.util';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type CreatedCoreWorkflow = {
  coreWorkflow: CoreWorkflowDTO;
  coreWorkflowVersionId: string;
};

@Injectable()
export class CoreWorkflowMutationWorkspaceService {
  private readonly logger = new Logger(
    CoreWorkflowMutationWorkspaceService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(WorkflowEntity)
    private readonly coreWorkflowRepository: WorkspaceScopedRepository<WorkflowEntity>,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly coreWorkflowTriggerService: CoreWorkflowTriggerService,
    private readonly coreWorkflowAccessService: CoreWorkflowAccessService,
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly coreWorkflowListService: CoreWorkflowListService,
    private readonly coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  private async runCoreWorkflowMigration({
    workspaceId,
    failureMessage,
    operations,
    applicationUniversalIdentifier,
    authContext,
  }: {
    workspaceId: string;
    failureMessage: string;
    operations: AllFlatEntityOperationByMetadataName;
    applicationUniversalIdentifier?: string;
    authContext?: WorkspaceAuthContext;
  }): Promise<void> {
    const universalIdentifier =
      applicationUniversalIdentifier ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication.universalIdentifier;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: operations,
          workspaceId,
          isSystemBuild: false,
          authContext,
          applicationUniversalIdentifier: universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        failureMessage,
      );
    }
  }

  async duplicateWorkflow({
    workspaceId,
    authContext,
    coreWorkflowIdToDuplicate,
    coreWorkflowVersionIdToCopy,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext | undefined;
    coreWorkflowIdToDuplicate: string;
    coreWorkflowVersionIdToCopy: string;
  }): Promise<CoreWorkflowDTO> {
    await this.coreWorkflowAccessService.assertCoreWorkflowsAreAccessibleOrThrow(
      {
        workspaceId,
        coreWorkflowIds: [coreWorkflowIdToDuplicate],
      },
    );

    const sourceCoreWorkflow = await this.coreWorkflowRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowIdToDuplicate } },
    );

    if (!isDefined(sourceCoreWorkflow)) {
      throw new WorkflowQueryValidationException(
        `Core workflow '${coreWorkflowIdToDuplicate}' not found`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        { userFriendlyMessage: msg`Workflow not found` },
      );
    }

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

    const duplicatedWorkflow = await this.createWorkflow({
      workspaceId,
      authContext,
      name: `${sourceCoreWorkflow.name ?? ''} (Duplicate)`,
      // duplicating a private workflow must not publish it to the workspace
      isPrivate: sourceCoreWorkflow.isPrivate,
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
        await this.deleteWorkflows({
          workspaceId,
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
    await this.writeInitialDraftContent({
      workspaceId,
      coreWorkflowId: duplicatedCoreWorkflowId,
      trigger,
      steps,
    });

    const duplicatedCoreWorkflow =
      await this.coreWorkflowListService.findOneById({
        workspaceId,
        callerApplication: undefined,
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

  async createWorkflowWithContent({
    workspaceId,
    authContext,
    name,
    trigger,
    steps,
    edges,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext | undefined;
    name: string;
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    edges: WorkflowVersionEdge[];
  }): Promise<CreatedCoreWorkflow> {
    // assembled before anything is created so an invalid edge leaves no workflow behind
    const content = assembleWorkflowVersionContent({ trigger, steps, edges });

    const coreWorkflow = await this.createWorkflow({
      workspaceId,
      authContext,
      name,
    });

    try {
      const coreWorkflowVersionId = await this.writeInitialDraftContent({
        workspaceId,
        coreWorkflowId: coreWorkflow.id,
        ...content,
      });

      return { coreWorkflow, coreWorkflowVersionId };
    } catch (error) {
      await this.workflowCoreSyncService.deleteFromCore(workspaceId, [
        coreWorkflow.id,
      ]);

      throw error;
    }
  }

  private async writeInitialDraftContent({
    workspaceId,
    coreWorkflowId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
  }): Promise<string> {
    const initialDraft = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      {
        where: {
          coreWorkflowId,
          status: CoreWorkflowVersionStatus.DRAFT,
        },
      },
    );

    if (!isDefined(initialDraft)) {
      throw new WorkflowQueryValidationException(
        `Core workflow '${coreWorkflowId}' has no initial draft version`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Draft creation failed, please retry`,
        },
      );
    }

    await this.coreWorkflowVersionWriteService.writeContent({
      workspaceId,
      coreWorkflowVersionId: initialDraft.id,
      expectedVersion: initialDraft,
      trigger,
      steps,
    });

    return initialDraft.id;
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

  async updateWorkflow({
    workspaceId,
    authContext,
    coreWorkflowId,
    name,
    isPrivate,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext | undefined;
    coreWorkflowId: string;
    name?: string;
    isPrivate?: boolean;
  }): Promise<void> {
    await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      coreWorkflowIds: [coreWorkflowId],
    });

    const { flatWorkflowMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowMaps'] },
      );

    const existingFlatWorkflow = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    });

    if (!isDefined(existingFlatWorkflow)) {
      return;
    }

    const flatWorkflowToUpdate: FlatWorkflow = {
      ...existingFlatWorkflow,
      ...(isDefined(name) ? { name } : {}),
      ...(isDefined(isPrivate) ? { isPrivate } : {}),
    };

    try {
      await this.runCoreWorkflowMigration({
        workspaceId,
        authContext,
        failureMessage:
          'Multiple validation errors occurred while updating workflow',
        operations: {
          workflow: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatWorkflowToUpdate],
          },
        },
      });
    } catch (error) {
      const ownershipConditionNotMetException =
        this.findWorkflowOwnershipConditionNotMetException(error);

      if (!isDefined(ownershipConditionNotMetException)) {
        throw error;
      }

      const coreWorkflowExists = await this.coreWorkflowRepository.exists(
        workspaceId,
        { where: { id: coreWorkflowId } },
      );

      if (!coreWorkflowExists) {
        return;
      }

      throw new WorkflowQueryValidationException(
        `Core workflow '${coreWorkflowId}' can only have its visibility changed by its creator`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage:
            ownershipConditionNotMetException.userFriendlyMessage,
        },
      );
    }

    if (isDefined(name)) {
      await this.syncCommandMenuItemLabelFromCore({
        workspaceId,
        coreWorkflowId,
        name,
      });
    }
  }

  private findWorkflowOwnershipConditionNotMetException(
    error: unknown,
  ): CoreWorkflowMetadataException | undefined {
    if (!(error instanceof WorkspaceMigrationRunnerException)) {
      return undefined;
    }

    const metadataError = error.errors?.metadata;

    if (
      metadataError instanceof CoreWorkflowMetadataException &&
      metadataError.code ===
        CoreWorkflowMetadataExceptionCode.WORKFLOW_OWNERSHIP_CONDITION_NOT_MET
    ) {
      return metadataError;
    }

    return undefined;
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

  async createWorkflow({
    workspaceId,
    authContext,
    name,
    isPrivate,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext | undefined;
    name?: string;
    isPrivate?: boolean;
  }): Promise<CoreWorkflowDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const createdAt = new Date().toISOString();

    const coreWorkflow = {
      id: uuidv4(),
      name: name ?? null,
      universalIdentifier: uuidv4(),
      workspaceWorkflowId: null,
      isSystem: false,
      isPrivate: isPrivate ?? false,
      createdByUserWorkspaceId:
        getUserWorkspaceIdFromAuthContext(authContext) ?? null,
      lastPublishedCoreWorkflowVersionId: null,
      versionDefinitionHash: null,
      createdAt,
      updatedAt: createdAt,
    };

    await this.runCoreWorkflowMigration({
      workspaceId,
      authContext,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      failureMessage:
        'Multiple validation errors occurred while creating workflow',
      operations: {
        workflow: {
          flatEntityToCreate: [
            {
              ...coreWorkflow,
              applicationUniversalIdentifier:
                workspaceCustomFlatApplication.universalIdentifier,
              navigationMenuItemUniversalIdentifiers: [],
            },
          ],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
      },
    });

    try {
      await this.coreWorkflowVersionWriteService.createDraftCoreWorkflowVersion(
        {
          workspaceId,
          coreWorkflowUniversalIdentifier: coreWorkflow.universalIdentifier,
          workspaceWorkflowId: null,
          trigger: null,
          steps: null,
        },
      );
    } catch (error) {
      try {
        await this.workflowCoreSyncService.deleteFromCore(workspaceId, [
          coreWorkflow.id,
        ]);
      } catch (rollbackError) {
        this.logger.error(rollbackError);
      }

      throw error;
    }

    return {
      id: coreWorkflow.id,
      name: coreWorkflow.name,
      statuses: [WorkflowStatus.DRAFT],
      applicationId: workspaceCustomFlatApplication.id,
      workspaceWorkflowId: null,
      isSystem: coreWorkflow.isSystem,
      isPrivate: coreWorkflow.isPrivate,
      canChangeVisibility: canCallerChangePrivatableEntityPrivacy({
        privatableEntity: coreWorkflow,
        authContext,
      }),
      createdAt: coreWorkflow.createdAt,
      updatedAt: coreWorkflow.updatedAt,
    };
  }

  async deleteWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<DeletedCoreWorkflowDTO[]> {
    await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      coreWorkflowIds,
    });

    const coreWorkflowsToDelete = await this.coreWorkflowRepository.find(
      workspaceId,
      {
        where: { id: In(coreWorkflowIds) },
        select: { id: true, workspaceWorkflowId: true },
      },
    );

    const deletedCoreWorkflows = coreWorkflowsToDelete.map(
      ({ id, workspaceWorkflowId }) => ({ id, workspaceWorkflowId }),
    );

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      coreWorkflowIds,
    );

    return deletedCoreWorkflows;
  }

  async discardDraftVersion({
    workspaceId,
    coreWorkflowVersionId,
  }: DiscardCoreWorkflowDraftInput & {
    workspaceId: string;
  }): Promise<string | null> {
    const coreVersion = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowVersionId } },
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

    await this.coreWorkflowAccessService.assertCoreWorkflowsAreEditableOrThrow({
      workspaceId,
      coreWorkflowIds: [coreVersion.coreWorkflowId],
    });

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

    const { flatWorkflowVersionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatWorkflowVersionMaps'] },
      );

    const flatCoreVersionToDelete = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: coreVersion.id,
      flatEntityMaps: flatWorkflowVersionMaps,
    });

    await this.runCoreWorkflowMigration({
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

    await this.coreWorkflowTriggerService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

    return coreVersion.coreWorkflowId;
  }
}
