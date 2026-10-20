import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowUnsavedFlowKeysComponentState = createAtomComponentState<
  string[]
>({
  key: 'workflowUnsavedFlowKeysComponentState',
  defaultValue: [],
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
