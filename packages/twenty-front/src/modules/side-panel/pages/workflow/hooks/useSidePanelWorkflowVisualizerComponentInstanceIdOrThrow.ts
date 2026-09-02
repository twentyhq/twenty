import { sidePanelWorkflowVisualizerComponentInstanceIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVisualizerComponentInstanceIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelWorkflowVisualizerComponentInstanceIdOrThrow = () => {
  const sidePanelWorkflowVisualizerComponentInstanceId =
    useAtomComponentStateValue(
      sidePanelWorkflowVisualizerComponentInstanceIdComponentState,
    );

  if (!isDefined(sidePanelWorkflowVisualizerComponentInstanceId)) {
    throw new Error(
      'Expected the workflow visualizer component instance ID to be defined',
    );
  }

  return sidePanelWorkflowVisualizerComponentInstanceId;
};
