import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const useWorkflowVersionIdOrThrow = () => {
  const workflowVisualizerWorkflowVersionId = useAtomComponentStateValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  if (!isDefined(workflowVisualizerWorkflowVersionId)) {
    throw new Error(
      doNotTranslate('Expected the workflow version ID to be defined'),
    );
  }

  return workflowVisualizerWorkflowVersionId;
};
