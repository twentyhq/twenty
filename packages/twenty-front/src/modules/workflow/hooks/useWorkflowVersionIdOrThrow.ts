import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useRecoilComponentValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  if (!isDefined(workflowVersionId)) {
    throw new Error('Expected the workflow version ID to be defined');
  }

  return workflowVersionId;
};
