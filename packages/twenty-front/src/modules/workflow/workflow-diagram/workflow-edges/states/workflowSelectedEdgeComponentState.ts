import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdge';

export const workflowSelectedEdgeComponentState = createComponentState<
  WorkflowDiagramEdge | undefined
>({
  key: 'workflowSelectedEdgeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
