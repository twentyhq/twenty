import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowRunId = useRecoilComponentValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  if (!isDefined(workflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowRunId;
};
