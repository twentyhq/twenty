import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

/**
 * This function returns the reference of the array where the step should be positioned
 * and at which index.
 */
export const findStepPosition = ({
  steps,
  stepId,
}: {
  steps: Array<WorkflowStep>;
  stepId: string | undefined;
}): { steps: Array<WorkflowStep>; index: number } | undefined => {
  if (!isDefined(stepId) || stepId === TRIGGER_STEP_ID) {
    return {
      steps,
      index: 0,
    };
  }

  for (const [index, step] of steps.entries()) {
    if (step.id === stepId) {
      return {
        steps,
        index,
      };
    }

    // TODO: When condition will have been implemented, put recursivity here.
    // if (step.type === "CONDITION") {
    //     return findNodePosition({
    //         workflowSteps: step.conditions,
    //         stepId,
    //     })
    // }
  }

  return undefined;
};
