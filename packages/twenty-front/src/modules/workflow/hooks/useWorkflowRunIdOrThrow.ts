import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowRunIdOrThrow = () => {
  const workflowRunId = useAtomComponentStateValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  if (!isDefined(workflowRunId)) {
    throw new Error('Expected the workflow run ID to be defined');
  }

  return workflowRunId;
};
