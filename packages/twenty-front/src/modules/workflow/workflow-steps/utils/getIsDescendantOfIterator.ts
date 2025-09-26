import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isParentStep } from '@/workflow/workflow-diagram/utils/isParentStep';

export const getIsDescendantOfIterator = ({
  stepId,
  steps,
}: {
  stepId: string;
  steps: WorkflowStep[];
}): boolean => {
  const hasIteratorAncestor = (
    currentStepId: string,
    visited = new Set<string>(),
  ): boolean => {
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
