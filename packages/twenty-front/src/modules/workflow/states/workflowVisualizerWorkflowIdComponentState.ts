import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowVisualizerWorkflowIdComponentState = createComponentState<
  string | undefined
>({
  key: 'workflowVisualizerWorkflowIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
