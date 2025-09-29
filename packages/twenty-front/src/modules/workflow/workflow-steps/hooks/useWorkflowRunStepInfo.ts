import { workflowRunIteratorSubStepIterationIndexComponentState } from '@/command-menu/pages/workflow/step/view-run/states/workflowRunIteratorSubStepIterationIndexComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getWorkflowRunAllStepInfoHistory } from '@/workflow/workflow-steps/utils/getWorkflowRunAllStepInfoHistory';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunStepInfo = ({ stepId }: { stepId: string }) => {
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  const workflowRunIteratorSubStepIterationIndex = useRecoilComponentValue(
    workflowRunIteratorSubStepIterationIndexComponentState,
  );

  const stepInfo = workflowRun?.state?.stepInfos[stepId];

  if (!isDefined(stepInfo)) {
    return undefined;
  }

  const allStepInfoHistory = getWorkflowRunAllStepInfoHistory({ stepInfo });

  return allStepInfoHistory[workflowRunIteratorSubStepIterationIndex];
};
