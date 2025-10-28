import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isLastStepOfLoop } from '@/workflow/workflow-diagram/utils/isLastStepOfLoop';

const isParentStep = ({
  currentStep,
  potentialParentStep,
  steps,
}: {
  currentStep: WorkflowStep;
  potentialParentStep: WorkflowStep;
  steps: WorkflowStep[];
}): boolean => {
  if (potentialParentStep.type === 'ITERATOR') {
    return !!(
      potentialParentStep.settings.input.initialLoopStepIds?.includes(
        currentStep.id,
      ) || potentialParentStep.nextStepIds?.includes(currentStep.id)
    );
  }

  if (currentStep.type === 'ITERATOR') {
    return !!(
      potentialParentStep.nextStepIds?.includes(currentStep.id) &&
      !isLastStepOfLoop({
        iterator: currentStep,
        stepId: potentialParentStep.id,
        steps,
      })
    );
  }

  return !!potentialParentStep.nextStepIds?.includes(currentStep.id);
};

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
