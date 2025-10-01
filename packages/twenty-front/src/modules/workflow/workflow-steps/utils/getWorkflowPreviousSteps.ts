import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isParentStep } from '@/workflow/workflow-diagram/utils/isParentStep';

export const getPreviousSteps = ({
  steps,
  currentStep,
  visitedSteps = new Set([currentStep.id]),
}: {
  steps: WorkflowStep[];
  currentStep: WorkflowStep;
  visitedSteps?: Set<string>;
}): WorkflowStep[] => {
  const parentSteps = steps
    .filter((step) =>
      isParentStep({
        currentStep,
        potentialParentStep: step,
        steps,
      }),
    )
    .filter((step) => !visitedSteps.has(step.id));

  const grandParentSteps = parentSteps
    .map((step) => {
      if (visitedSteps.has(step.id)) {
        return [];
      }
      visitedSteps.add(step.id);
      return getPreviousSteps({ steps, currentStep: step, visitedSteps });
    })
    .flat();

  return [...grandParentSteps, ...parentSteps];
};
