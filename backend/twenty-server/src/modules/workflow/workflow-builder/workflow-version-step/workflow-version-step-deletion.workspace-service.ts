import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';

@Injectable()
export class WorkflowVersionStepDeletionWorkspaceService {
  constructor(
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowVersionStepHelpersWorkspaceService: WorkflowVersionStepHelpersWorkspaceService,
  ) {}

  async deleteWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepIdToDelete,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepIdToDelete: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersion =
      await this.workflowVersionStepHelpersWorkspaceService.getValidatedDraftWorkflowVersion(
        {
          workflowVersionId,
          workspaceId,
        },
      );

    const existingTrigger = workflowVersion.trigger;

    const isDeletingTrigger =
      stepIdToDelete === TRIGGER_STEP_ID && isDefined(existingTrigger);

    if (!isDeletingTrigger && !isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't delete step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const stepToDelete = workflowVersion.steps?.find(
      (step) => step.id === stepIdToDelete,
    );

    if (!isDeletingTrigger && !isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const stepToDeleteChildrenIds = isDeletingTrigger
      ? (existingTrigger?.nextStepIds ?? [])
      : (stepToDelete?.nextStepIds ?? []);

    const { updatedSteps, updatedTrigger, removedStepIds } = removeStep({
      existingTrigger,
      existingSteps: workflowVersion.steps,
      stepIdToDelete,
      stepToDeleteChildrenIds,
    });

    await this.workflowVersionStepHelpersWorkspaceService.updateWorkflowVersionStepsAndTrigger(
      {
        workspaceId,
        workflowVersionId: workflowVersion.id,
        steps: updatedSteps,
        trigger: updatedTrigger,
      },
    );

    const removedSteps =
      workflowVersion.steps?.filter((step) =>
        removedStepIds.includes(step.id),
      ) ?? [];

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
      existingTrigger,
      existingSteps: workflowVersion.steps,
      updatedTrigger,
      updatedSteps,
    });
  }
}
