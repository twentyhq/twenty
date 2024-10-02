import { WorkflowStep } from '@/workflow/types/Workflow';
import { findStepPositionOrThrow } from '@/workflow/utils/findStepPositionOrThrow';

export const removeStep = ({
  steps: stepsInitial,
  stepId,
}: {
  steps: Array<WorkflowStep>;
  stepId: string | undefined;
}) => {
  const steps = structuredClone(stepsInitial);

  const parentStepPosition = findStepPositionOrThrow({
    steps,
    stepId,
  });

  parentStepPosition.steps.splice(parentStepPosition.index, 1);

  return steps;
};
