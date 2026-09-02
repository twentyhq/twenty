import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowVisualizerComponentInstanceIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'side-panel/workflow-visualizer-component-instance-id',
    defaultValue: undefined,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
