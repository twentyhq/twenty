import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { type CreateCoreWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-core-workflow-version-step.input';
import { type WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update.input';
import { type WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { type WorkflowVersionTriggerDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-trigger.dto';
import {
  WorkflowVersionEntity,
  WorkflowVersionStatus as CoreWorkflowVersionStatus,
} from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { CoreWorkflowIdResolutionService } from 'src/engine/core-modules/workflow/services/core-workflow-id-resolution.service';
import { CoreWorkflowVersionListService } from 'src/engine/core-modules/workflow/services/core-workflow-version-list.service';
import { CoreWorkflowVersionWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-version-write.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import {
  assertEdgeConnectionOptionsAreSupported,
  buildSourceStepWithAddedEdge,
  buildSourceStepWithRemovedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepConnectionOptions';
import { getNextStepIdsForStepTypeChange } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/get-next-step-ids-for-step-type-change.util';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';

@Injectable()
export class CoreWorkflowVersionMutationWorkspaceService {
  constructor(
    @InjectWorkspaceScopedRepository(WorkflowVersionEntity)
    private readonly coreWorkflowVersionRepository: WorkspaceScopedRepository<WorkflowVersionEntity>,
    private readonly coreWorkflowIdResolutionService: CoreWorkflowIdResolutionService,
    private readonly coreWorkflowVersionWriteService: CoreWorkflowVersionWriteService,
    private readonly coreWorkflowVersionListService: CoreWorkflowVersionListService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
  ) {}

  async createStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateCoreWorkflowVersionStepInput;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const {
      coreWorkflowVersionId,
      stepType,
      parentStepId,
      nextStepId,
      position,
      parentStepConnectionOptions,
      id,
      defaultSettings,
    } = input;

    const { coreWorkflowVersion, trigger, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    const { builtStep, additionalCreatedSteps } =
      await this.workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep(
        {
          type: stepType,
          workspaceId,
          position,
          id,
          defaultSettings,
        },
      );

    const enrichedNewStep =
      await this.workflowSchemaWorkspaceService.enrichOutputSchema({
        step: builtStep,
        workspaceId,
        workflowVersionContent: { trigger, steps },
      });

    const { updatedSteps, updatedTrigger } = insertStep({
      existingSteps: steps ?? [],
      existingTrigger: trigger,
      insertedStep: enrichedNewStep,
      additionalCreatedSteps,
      parentStepId,
      nextStepId,
      parentStepConnectionOptions,
    });

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger: updatedTrigger ?? null,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async duplicateStep({
    workspaceId,
    coreWorkflowVersionId,
    stepId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    stepId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { coreWorkflowVersion, trigger, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    const stepToDuplicate = steps?.find((step) => step.id === stepId);

    if (!isDefined(stepToDuplicate)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const clonedStep =
      await this.workflowVersionStepOperationsWorkspaceService.cloneStep({
        step: stepToDuplicate,
        workspaceId,
      });

    const duplicatedStep =
      this.workflowVersionStepOperationsWorkspaceService.markStepAsDuplicate({
        step: clonedStep,
      });

    const { updatedSteps, updatedTrigger } = insertStep({
      existingSteps: steps ?? [],
      existingTrigger: trigger,
      insertedStep: duplicatedStep,
    });

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger: updatedTrigger ?? null,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async updateStep({
    workspaceId,
    coreWorkflowVersionId,
    step,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    step: WorkflowAction;
  }): Promise<WorkflowActionDTO> {
    const { coreWorkflowVersion, trigger, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    if (!isDefined(steps)) {
      throw new WorkflowVersionStepException(
        "Can't update step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const existingStep = steps.find(
      (candidateStep) => candidateStep.id === step.id,
    );

    if (!isDefined(existingStep)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const isStepTypeChanged = existingStep.type !== step.type;

    const { updatedStep, additionalCreatedSteps } = isStepTypeChanged
      ? await this.rebuildStepForTypeChange({
          existingStep,
          newStep: step,
          workspaceId,
          workflowVersionContent: { trigger, steps },
        })
      : {
          updatedStep:
            await this.workflowSchemaWorkspaceService.enrichOutputSchema({
              step,
              workspaceId,
              workflowVersionContent: { trigger, steps },
            }),
          additionalCreatedSteps: undefined,
        };

    const updatedSteps = steps.map((candidateStep) =>
      candidateStep.id === step.id ? updatedStep : candidateStep,
    );

    if (isDefined(additionalCreatedSteps)) {
      updatedSteps.push(...additionalCreatedSteps);
    }

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger,
      steps: updatedSteps,
    });

    return updatedStep;
  }

  async updateTrigger({
    workspaceId,
    coreWorkflowVersionId,
    trigger,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    trigger: WorkflowTrigger;
  }): Promise<WorkflowVersionTriggerDTO> {
    const { coreWorkflowVersion, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger,
      steps,
    });

    return { trigger };
  }

  async deleteStep({
    workspaceId,
    coreWorkflowVersionId,
    stepIdToDelete,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    stepIdToDelete: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const { coreWorkflowVersion, trigger, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    const isDeletingTrigger =
      stepIdToDelete === TRIGGER_STEP_ID && isDefined(trigger);

    if (!isDeletingTrigger && !isDefined(steps)) {
      throw new WorkflowVersionStepException(
        "Can't delete step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const stepToDelete = steps?.find((step) => step.id === stepIdToDelete);

    if (!isDeletingTrigger && !isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const stepToDeleteChildrenIds = isDeletingTrigger
      ? (trigger?.nextStepIds ?? [])
      : (stepToDelete?.nextStepIds ?? []);

    const { updatedSteps, updatedTrigger, removedStepIds } = removeStep({
      existingTrigger: trigger,
      existingSteps: steps,
      stepIdToDelete,
      stepToDeleteChildrenIds,
    });

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger: updatedTrigger ?? null,
      steps: updatedSteps ?? null,
    });

    const removedSteps =
      steps?.filter((step) => removedStepIds.includes(step.id)) ?? [];

    await Promise.all(
      removedSteps.map((step) =>
        this.workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects(
          {
            step,
            workspaceId,
          },
        ),
      ),
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async createEdge({
    workspaceId,
    coreWorkflowVersionId,
    source,
    target,
    sourceConnectionOptions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    source: string;
    target: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    assertEdgeConnectionOptionsAreSupported(sourceConnectionOptions);

    const { coreWorkflowVersion, trigger, steps } =
      await this.getValidatedDraftWithTargetStep({
        workspaceId,
        coreWorkflowVersionId,
        target,
      });

    if (source === TRIGGER_STEP_ID) {
      if (!isDefined(trigger)) {
        throw new WorkflowVersionEdgeException(
          `Trigger not found in core workflow version '${coreWorkflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      if (trigger.nextStepIds?.includes(target)) {
        return computeWorkflowVersionStepChanges({
          existingTrigger: trigger,
          existingSteps: steps,
        });
      }

      const updatedTrigger = {
        ...trigger,
        nextStepIds: [...(trigger.nextStepIds ?? []), target],
      };

      await this.coreWorkflowVersionWriteService.writeContentAndMirror({
        workspaceId,
        coreWorkflowVersionId,
        expectedVersion: coreWorkflowVersion,
        trigger: updatedTrigger,
        steps,
      });

      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
        updatedTrigger,
      });
    }

    const sourceStep = this.getSourceStepOrThrow({
      steps,
      source,
      coreWorkflowVersionId,
    });

    if (
      sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const { updatedSourceStep, shouldPersist } = buildSourceStepWithAddedEdge({
      sourceStep,
      target,
      sourceConnectionOptions,
    });

    const updatedSteps = (steps ?? []).map((step) =>
      step.id === source ? updatedSourceStep : step,
    );

    if (shouldPersist) {
      await this.coreWorkflowVersionWriteService.writeContentAndMirror({
        workspaceId,
        coreWorkflowVersionId,
        expectedVersion: coreWorkflowVersion,
        trigger,
        steps: updatedSteps,
      });
    }

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
    });
  }

  async deleteEdge({
    workspaceId,
    coreWorkflowVersionId,
    source,
    target,
    sourceConnectionOptions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    source: string;
    target: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    assertEdgeConnectionOptionsAreSupported(sourceConnectionOptions);

    const { coreWorkflowVersion, trigger, steps } =
      await this.getValidatedDraftWithTargetStep({
        workspaceId,
        coreWorkflowVersionId,
        target,
      });

    if (source === TRIGGER_STEP_ID) {
      if (!isDefined(trigger)) {
        throw new WorkflowVersionEdgeException(
          `Trigger not found in core workflow version '${coreWorkflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      if (!trigger.nextStepIds?.includes(target)) {
        return computeWorkflowVersionStepChanges({
          existingTrigger: trigger,
          existingSteps: steps,
        });
      }

      const updatedTrigger = {
        ...trigger,
        nextStepIds: trigger.nextStepIds?.filter(
          (nextStepId) => nextStepId !== target,
        ),
      };

      await this.coreWorkflowVersionWriteService.writeContentAndMirror({
        workspaceId,
        coreWorkflowVersionId,
        expectedVersion: coreWorkflowVersion,
        trigger: updatedTrigger,
        steps,
      });

      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
        updatedTrigger,
      });
    }

    const sourceStep = this.getSourceStepOrThrow({
      steps,
      source,
      coreWorkflowVersionId,
    });

    if (
      !sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const { updatedSourceStep, shouldPersist } = buildSourceStepWithRemovedEdge(
      {
        sourceStep,
        target,
        sourceConnectionOptions,
      },
    );

    if (!shouldPersist) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const updatedSteps = (steps ?? []).map((step) =>
      step.id === source ? updatedSourceStep : step,
    );

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
    });
  }

  async updatePositions({
    workspaceId,
    coreWorkflowVersionId,
    positions,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    positions: WorkflowStepPositionUpdateInput[];
  }): Promise<void> {
    const { coreWorkflowVersion, trigger, steps } =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    const triggerPosition = positions.find(
      (position) => position.id === TRIGGER_STEP_ID,
    );

    const updatedTrigger =
      isDefined(triggerPosition) && isDefined(trigger)
        ? { ...trigger, position: triggerPosition.position }
        : undefined;

    const updatedSteps = steps?.map((step) => {
      const stepPosition = positions.find(
        (position) => position.id === step.id,
      );

      return isDefined(stepPosition)
        ? { ...step, position: stepPosition.position }
        : step;
    });

    await this.coreWorkflowVersionWriteService.writeContentAndMirror({
      workspaceId,
      coreWorkflowVersionId,
      expectedVersion: coreWorkflowVersion,
      trigger: updatedTrigger ?? trigger,
      steps: updatedSteps ?? steps,
    });
  }

  @WithLock('coreWorkflowId')
  async createDraftFromCoreWorkflowVersion({
    workspaceId,
    coreWorkflowId,
    coreWorkflowVersionIdToCopy,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    coreWorkflowVersionIdToCopy: string;
  }): Promise<CoreWorkflowVersionDTO> {
    const { coreWorkflow, workspaceWorkflowId } =
      await this.coreWorkflowIdResolutionService.resolveWorkspaceWorkflowIdOrThrow(
        { workspaceId, coreWorkflowId },
      );

    const versionToCopy = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { id: coreWorkflowVersionIdToCopy, coreWorkflowId } },
    );

    if (!isDefined(versionToCopy)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion to copy not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const triggerToCopy = versionToCopy.triggers?.[0];

    if (
      !isDefined(triggerToCopy) ||
      !isNonEmptyArray(versionToCopy.steps ?? [])
    ) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion to copy has no trigger or no steps',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const copiedSteps: WorkflowAction[] = [];

    for (const step of versionToCopy.steps ?? []) {
      copiedSteps.push(
        await this.workflowVersionStepOperationsWorkspaceService.createDraftStep(
          {
            step,
            workspaceId,
          },
        ),
      );
    }

    const existingDraft = await this.coreWorkflowVersionRepository.findOne(
      workspaceId,
      { where: { coreWorkflowId, status: CoreWorkflowVersionStatus.DRAFT } },
    );

    if (isDefined(existingDraft)) {
      await this.coreWorkflowVersionWriteService.writeContentAndMirror({
        workspaceId,
        coreWorkflowVersionId: existingDraft.id,
        expectedVersion: existingDraft,
        trigger: triggerToCopy,
        steps: copiedSteps,
      });

      return this.findCoreVersionDTOOrThrow({
        workspaceId,
        coreWorkflowVersionId: existingDraft.id,
      });
    }

    const applicationId =
      await this.workflowCoreSyncService.getCustomApplicationIdOrThrow(
        workspaceId,
      );

    const { coreWorkflowVersionId } =
      await this.coreWorkflowVersionWriteService.createDraftCoreWorkflowVersionAndMirror(
        {
          workspaceId,
          coreWorkflowId: coreWorkflow.id,
          workspaceWorkflowId,
          applicationId,
          trigger: triggerToCopy,
          steps: copiedSteps,
        },
      );

    return this.findCoreVersionDTOOrThrow({
      workspaceId,
      coreWorkflowVersionId,
    });
  }

  private async rebuildStepForTypeChange({
    existingStep,
    newStep,
    workspaceId,
    workflowVersionContent,
  }: {
    existingStep: WorkflowAction;
    newStep: WorkflowAction;
    workspaceId: string;
    workflowVersionContent: {
      trigger: WorkflowTrigger | null;
      steps: WorkflowAction[] | null;
    };
  }): Promise<{
    updatedStep: WorkflowAction;
    additionalCreatedSteps?: WorkflowAction[];
  }> {
    await this.workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects(
      {
        step: existingStep,
        workspaceId,
      },
    );

    const { builtStep, additionalCreatedSteps } =
      await this.workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep(
        {
          type: newStep.type,
          workspaceId,
          position: newStep.position,
          defaultSettings: newStep.settings,
        },
      );

    const updatedStep =
      await this.workflowSchemaWorkspaceService.enrichOutputSchema({
        step: {
          ...builtStep,
          id: existingStep.id,
          nextStepIds: getNextStepIdsForStepTypeChange({
            existingStep,
            builtStep,
          }),
          position: existingStep.position,
        },
        workspaceId,
        workflowVersionContent,
      });

    return { updatedStep, additionalCreatedSteps };
  }

  private async getValidatedDraftWithTargetStep({
    workspaceId,
    coreWorkflowVersionId,
    target,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    target: string;
  }) {
    const validatedDraft =
      await this.coreWorkflowVersionWriteService.getValidatedDraftCoreWorkflowVersion(
        { workspaceId, coreWorkflowVersionId },
      );

    const targetStep = validatedDraft.steps?.find((step) => step.id === target);

    if (!isDefined(targetStep)) {
      throw new WorkflowVersionEdgeException(
        `Target step '${target}' not found in core workflow version '${coreWorkflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    return validatedDraft;
  }

  private getSourceStepOrThrow({
    steps,
    source,
    coreWorkflowVersionId,
  }: {
    steps: WorkflowAction[] | null;
    source: string;
    coreWorkflowVersionId: string;
  }): WorkflowAction {
    const sourceStep = steps?.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in core workflow version '${coreWorkflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    return sourceStep;
  }

  private async findCoreVersionDTOOrThrow({
    workspaceId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
  }): Promise<CoreWorkflowVersionDTO> {
    const coreWorkflowVersion =
      await this.coreWorkflowVersionListService.findOneByCoreWorkflowVersionId({
        workspaceId,
        coreWorkflowVersionId,
      });

    if (!isDefined(coreWorkflowVersion)) {
      throw new WorkflowQueryValidationException(
        `Core version '${coreWorkflowVersionId}' not found after the draft write`,
        WorkflowQueryValidationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Draft creation failed, please retry`,
        },
      );
    }

    return coreWorkflowVersion;
  }
}
