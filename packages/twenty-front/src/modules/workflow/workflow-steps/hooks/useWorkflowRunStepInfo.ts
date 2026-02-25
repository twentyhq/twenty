import { workflowRunIteratorSubStepIterationIndexComponentState } from '@/command-menu/pages/workflow/step/view-run/states/workflowRunIteratorSubStepIterationIndexComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { isDefined } from 'twenty-shared/utils';
import { getStepInfoHistoryItem } from '@/workflow/workflow-steps/utils/getStepInfoHistoryItem';

export const useWorkflowRunStepInfo = ({ stepId }: { stepId: string }) => {
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  const workflowRunIteratorSubStepIterationIndex = useAtomComponentStateValue(
    workflowRunIteratorSubStepIterationIndexComponentState,
  );

  const stepInfo = workflowRun?.state?.stepInfos[stepId];

  if (!isDefined(stepInfo) || !isDefined(workflowRun?.state?.flow)) {
    return undefined;
  }

  return getStepInfoHistoryItem({
    stepInfo,
    steps: workflowRun.state.flow.steps,
    stepId,
    iterationIndex: workflowRunIteratorSubStepIterationIndex,
  });
};
