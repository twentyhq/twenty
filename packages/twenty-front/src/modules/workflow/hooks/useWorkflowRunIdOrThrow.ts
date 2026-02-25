import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowVisualizerWorkflowRunId = useAtomComponentStateValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  if (!isDefined(workflowVisualizerWorkflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowVisualizerWorkflowRunId;
};
