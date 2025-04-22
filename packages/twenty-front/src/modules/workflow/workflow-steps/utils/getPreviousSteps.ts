import { WorkflowStep } from '@/workflow/types/Workflow';

export const getPreviousSteps = (
  steps: WorkflowStep[],
  currentStepId: string,
): WorkflowStep[] => {
  const directPreviousSteps = steps.filter((step) =>
    step.nextStepIds?.includes(currentStepId),
  );

  const previousSteps = directPreviousSteps
    .map((step) => {
      return getPreviousSteps(steps, step.id);
    })
    .flat();

  return Array.from(new Set([...directPreviousSteps, ...previousSteps]));
};
