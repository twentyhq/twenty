import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isLastStepOfLoop } from '@/workflow/workflow-diagram/utils/isLastStepOfLoop';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

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
    return (
      potentialParentStep.settings.input.initialLoopStepIds?.includes(
        currentStep.id,
      ) === true
    );
  }

  if (currentStep.type === 'ITERATOR') {
    return (
      potentialParentStep.nextStepIds?.includes(currentStep.id) === true &&
      !isLastStepOfLoop({
        iterator: currentStep,
        stepId: potentialParentStep.id,
        steps,
      })
    );
  }

  return potentialParentStep.nextStepIds?.includes(currentStep.id) === true;
};

export const getIsDescendantOfIterator = ({
  stepId,
  steps,
  iteratorId,
}: {
  stepId: string;
  steps: WorkflowStep[];
  iteratorId?: string;
}): boolean => {
  const hasIteratorAncestor = (
    currentStepId: string,
    visited = new Set<string>(),
  ): boolean => {
    if (currentStepId === TRIGGER_STEP_ID) {
      return false;
    }

    const currentStep = steps.find((step) => step.id === currentStepId);
    if (!currentStep) {
      throw new Error(`Step with ID ${currentStepId} not found`);
    }

    const parentSteps = steps
      .filter((step) =>
        isParentStep({
          currentStep,
          potentialParentStep: step,
          steps,
        }),
      )
      .filter((step) => !visited.has(step.id));

    for (const parent of parentSteps) {
      visited.add(currentStepId);

      if (parent.type === 'ITERATOR') {
        if (isDefined(iteratorId)) {
          return parent.id === iteratorId;
        }

        return true;
      }

      if (hasIteratorAncestor(parent.id, visited)) {
        return true;
      }
    }

    return false;
  };

  return hasIteratorAncestor(stepId);
};
