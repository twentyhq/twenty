import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';

export type ArrowTipDragState = {
  isDragging: boolean;
  dragPosition: { x: number; y: number };
  previewPath: string;
  draggedEdge: WorkflowDiagramEdgeDescriptor | null;
};

export const workflowArrowTipDraggedComponentState =
  createComponentState<ArrowTipDragState>({
    key: 'workflowArrowTipDraggedComponentState',
    defaultValue: {
      isDragging: false,
      dragPosition: { x: 0, y: 0 },
      previewPath: '',
      draggedEdge: null,
    },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
