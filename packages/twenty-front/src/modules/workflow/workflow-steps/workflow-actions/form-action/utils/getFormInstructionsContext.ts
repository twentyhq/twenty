import { type WorkflowRun } from '@/workflow/types/Workflow';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { isDefined } from 'twenty-shared/utils';

export const getFormInstructionsContext = ({
  stepId,
  workflowRun,
  iterationIndex,
}: {
  stepId: string;
  workflowRun: WorkflowRun | undefined;
  iterationIndex: number;
}): Record<string, unknown> | undefined => {
  const state = workflowRun?.state;

  if (
    !isDefined(state) ||
    !state.flow.steps.some((step) => step.id === stepId)
  ) {
    return undefined;
  }

  const stepContext = getWorkflowRunStepContext({
    stepId,
    stepInfos: state.stepInfos,
    flow: state.flow,
    currentLoopIterationIndex: getIsDescendantOfIterator({
      stepId,
      steps: state.flow.steps,
    })
      ? iterationIndex
      : undefined,
  });

  return Object.fromEntries(
    stepContext.map(({ id, context }) => [id, context]),
  );
};
