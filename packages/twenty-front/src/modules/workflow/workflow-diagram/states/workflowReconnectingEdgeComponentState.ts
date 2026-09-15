import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

type WorkflowReconnectingEdgeState = WorkflowDiagramEdge & {
  forbiddenTargetStepIds: Set<string>;
};

export const workflowReconnectingEdgeComponentState = createAtomComponentState<
  WorkflowReconnectingEdgeState | undefined
>({
  key: 'workflowReconnectingEdgeComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
