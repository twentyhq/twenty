import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowDiagramRightClickMenuPositionState =
  | {
      x: number;
      y: number;
    }
  | undefined;

export const workflowDiagramRightClickMenuPositionState =
  createAtomComponentState<WorkflowDiagramRightClickMenuPositionState>({
    key: 'workflowDiagramRightClickMenuPositionState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
