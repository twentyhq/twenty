import { WorkflowStep } from '@/workflow/types/Workflow';
import { findStepPosition } from '@/workflow/utils/findStepPosition';
import { isDefined } from 'twenty-ui';

/**
 * This function returns the reference of the array where the step should be positioned
 * and at which index.
 */
export const findStepPositionOrThrow = (props: {
  steps: Array<WorkflowStep>;
  stepId: string | undefined;
}): { steps: Array<WorkflowStep>; index: number } => {
  const result = findStepPosition(props);
  if (!isDefined(result)) {
    throw new Error(
      `Couldn't locate the step. Unreachable step id: ${props.stepId}.`,
    );
  }

  return result;
};
