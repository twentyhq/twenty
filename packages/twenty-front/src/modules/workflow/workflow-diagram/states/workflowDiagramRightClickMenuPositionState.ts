import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowDiagramRightClickMenuPositionState =
  | {
      x: number;
      y: number;
    }
  | undefined;

export const workflowDiagramRightClickMenuPositionState =
  createComponentState<WorkflowDiagramRightClickMenuPositionState>({
    key: 'workflowDiagramRightClickMenuPositionState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
