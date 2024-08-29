import { WorkflowStep } from '@/workflow/types/Workflow';
import { findStepPositionOrThrow } from '@/workflow/utils/findStepPositionOrThrow';

export const replaceStep = ({
  steps: stepsInitial,
  stepId,
  stepToReplace,
}: {
  steps: Array<WorkflowStep>;
  stepId: string;
  stepToReplace: Partial<Omit<WorkflowStep, 'id'>>;
}) => {
  // Make a deep copy of the nested object to prevent unwanted side effects.
  const steps = structuredClone(stepsInitial);

  const parentStepPosition = findStepPositionOrThrow({
    steps,
    stepId,
  });

  parentStepPosition.steps[parentStepPosition.index] = {
    ...parentStepPosition.steps[parentStepPosition.index],
    ...stepToReplace,
  };

  return steps;
};
