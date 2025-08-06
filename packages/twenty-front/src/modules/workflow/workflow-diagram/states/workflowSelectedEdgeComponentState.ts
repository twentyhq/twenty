import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowSelectedEdgeComponentState = createComponentState<
  { source: string; target: string } | undefined
>({
  key: 'workflowSelectedEdgeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
