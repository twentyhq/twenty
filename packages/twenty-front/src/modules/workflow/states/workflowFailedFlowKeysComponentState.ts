import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowFailedFlowKeysComponentState = createAtomComponentState<
  string[]
>({
  key: 'workflowFailedFlowKeysComponentState',
  defaultValue: [],
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
