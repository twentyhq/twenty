import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isLastStepOfLoop } from '@/workflow/workflow-diagram/utils/isLastStepOfLoop';
import { isDefined } from 'twenty-shared/utils';

export const getEdgePathStrategy = ({
  step,
  nextStepId,
  steps,
}: {
  step: WorkflowStep;
  nextStepId: string;
  steps: WorkflowStep[];
}) => {
  const nextStep = steps.find((s) => s.id === nextStepId);

  if (!isDefined(nextStep)) {
    return undefined;
  }

  const useLoopBackToIteratorStyle =
    nextStep.type === 'ITERATOR' &&
    isLastStepOfLoop({
      iterator: nextStep,
      stepId: step.id,
      steps,
    });

  return useLoopBackToIteratorStyle
    ? 'bypass-source-node-on-right-side'
    : undefined;
};
