import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useAtomComponentValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  if (!isDefined(workflowVersionId)) {
    throw new Error('Expected the workflow version ID to be defined');
  }

  return workflowVersionId;
};
