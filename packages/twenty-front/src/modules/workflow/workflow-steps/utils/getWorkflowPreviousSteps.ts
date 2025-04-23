import { WorkflowStep } from '@/workflow/types/Workflow';

export const getPreviousSteps = (
  steps: WorkflowStep[],
  currentStepId: string,
): WorkflowStep[] => {
  const parentSteps = steps.filter((step) =>
    step.nextStepIds?.includes(currentStepId),
  );

  const grandParentSteps = parentSteps
    .map((step) => {
      return getPreviousSteps(steps, step.id);
    })
    .flat();

  return Array.from(new Set([...grandParentSteps, ...parentSteps]));
};
