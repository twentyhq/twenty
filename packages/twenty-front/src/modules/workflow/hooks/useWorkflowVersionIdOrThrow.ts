import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowVersionIdOrThrow = () => {
  const workflowVersionId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  if (!isDefined(workflowVersionId)) {
    throw new Error('Expected the workflow version ID to be defined');
  }

  return workflowVersionId;
};
