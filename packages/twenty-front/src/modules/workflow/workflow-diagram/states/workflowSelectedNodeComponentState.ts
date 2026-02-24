import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowSelectedNodeComponentState = createComponentState<
  string | undefined
>({
  key: 'workflowSelectedNodeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
