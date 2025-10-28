import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';

export const workflowHoveredEdgeComponentState = createComponentState<
  WorkflowDiagramEdgeDescriptor | undefined
>({
  key: 'workflowHoveredEdgeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
