import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowDiagramRightClickMenuPositionState =
  | {
      x: number;
      y: number;
    }
  | undefined;

export const workflowDiagramRightClickMenuPositionState =
  createComponentStateV2<WorkflowDiagramRightClickMenuPositionState>({
    key: 'workflowDiagramRightClickMenuPositionState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
