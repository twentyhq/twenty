import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowRunId = useAtomComponentValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  if (!isDefined(workflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowRunId;
};
