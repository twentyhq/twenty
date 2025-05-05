import { WorkflowStep } from '@/workflow/types/Workflow';

export const getPreviousSteps = (
  steps: WorkflowStep[],
  currentStepId: string,
  visitedSteps: Set<string> = new Set([currentStepId]),
): WorkflowStep[] => {
  const parentSteps = steps
    .filter((step) => step.nextStepIds?.includes(currentStepId))
    .filter((step) => !visitedSteps.has(step.id));

  const grandParentSteps = parentSteps
    .map((step) => {
      if (visitedSteps.has(step.id)) {
        return [];
      }
      visitedSteps.add(step.id);
      return getPreviousSteps(steps, step.id, visitedSteps);
    })
    .flat();

  return [...grandParentSteps, ...parentSteps];
};
