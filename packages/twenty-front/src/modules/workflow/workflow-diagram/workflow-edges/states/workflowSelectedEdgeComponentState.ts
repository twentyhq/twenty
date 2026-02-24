import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';

export const workflowSelectedEdgeComponentState = createComponentStateV2<
  WorkflowDiagramEdgeDescriptor | undefined
>({
  key: 'workflowSelectedEdgeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
