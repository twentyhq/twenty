import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowPendingFlowKeysComponentState = createAtomComponentState<
  string[]
>({
  key: 'workflowPendingFlowKeysComponentState',
  defaultValue: [],
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
