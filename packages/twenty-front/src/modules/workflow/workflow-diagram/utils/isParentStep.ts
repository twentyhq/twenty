import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isLastStepOfLoop } from '@/workflow/workflow-diagram/utils/isLastStepOfLoop';

export const isParentStep = ({
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
