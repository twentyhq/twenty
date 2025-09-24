import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import {
  workflowArrowTipDraggedComponentState,
  type ArrowTipDragState,
} from '@/workflow/workflow-diagram/workflow-edges/states/workflowArrowTipDraggedComponentState';
import { workflowArrowTipHoveredEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowArrowTipHoveredEdgeComponentState';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { computePath } from '@/workflow/workflow-diagram/workflow-edges/utils/computePath';
import {
  getDragPosition,
  type Position,
} from '@/workflow/workflow-diagram/workflow-edges/utils/getDragPosition';
import { getNodePosition } from '@/workflow/workflow-diagram/workflow-edges/utils/getNodePosition';
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';

export const useArrowTipInteractions = () => {
  const reactflow = useReactFlow();
  const [dragState, setDragState] = useRecoilComponentState(
    workflowArrowTipDraggedComponentState,
  );
  const [hoveredEdge, setHoveredEdge] = useRecoilComponentState(
    workflowArrowTipHoveredEdgeComponentState,
  );

  const handleArrowTipHover = useCallback(
    (edgeDescriptor: WorkflowDiagramEdgeDescriptor) => {
      if (dragState.isDragging) return;

      setHoveredEdge(edgeDescriptor);

      reactflow.setEdges((edges) =>
        edges.map((edge) => {
          if (
            edge.source === edgeDescriptor.source &&
            edge.sourceHandle === edgeDescriptor.sourceHandle &&
            edge.target === edgeDescriptor.target &&
            edge.targetHandle === edgeDescriptor.targetHandle
          ) {
            return {
              ...edge,
              ...EDGE_BRANCH_ARROW_MARKER.Dragging,
            };
          }
          return edge;
        }),
      );
    },
    [dragState.isDragging, setHoveredEdge, reactflow],
  );

  const handleArrowTipHoverEnd = useCallback(() => {
    if (dragState.isDragging || !hoveredEdge) return;

    const previousEdge = hoveredEdge;
    setHoveredEdge(undefined);

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === previousEdge.source &&
          edge.sourceHandle === previousEdge.sourceHandle &&
          edge.target === previousEdge.target &&
          edge.targetHandle === previousEdge.targetHandle
        ) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Default,
          };
        }
        return edge;
      }),
    );
  }, [dragState.isDragging, hoveredEdge, setHoveredEdge, reactflow]);

  const handleDragStart = useCallback(
    (
      edgeDescriptor: WorkflowDiagramEdgeDescriptor,
      mousePosition: Position,
      targetPosition: Position,
    ) => {
      const sourceNode = reactflow.getNode(edgeDescriptor.source);
      if (!sourceNode) return;

      const sourcePosition = getNodePosition(
        sourceNode.position,
        sourceNode.measured || {},
      );

      setDragState({
        isDragging: true,
        dragPosition: targetPosition,
        previewPath: '',
        draggedEdge: edgeDescriptor,
      });

      setHoveredEdge(undefined);

      return { sourcePosition, mouseStart: mousePosition };
    },
    [reactflow, setDragState, setHoveredEdge],
  );

  const handleDragMove = useCallback(
    (
      mouseStart: Position,
      currentMouse: Position,
      targetPosition: Position,
      sourcePosition: Position,
    ) => {
      const newDragPosition = getDragPosition(
        targetPosition,
        mouseStart,
        currentMouse,
      );
      const previewPath = computePath(sourcePosition, newDragPosition);

      setDragState((prev: ArrowTipDragState) => ({
        ...prev,
        dragPosition: newDragPosition,
        previewPath,
      }));
    },
    [setDragState],
  );

  const handleDragEnd = useCallback(
    (targetPosition: Position) => {
      setDragState({
        isDragging: false,
        dragPosition: targetPosition,
        previewPath: '',
        draggedEdge: null,
      });
    },
    [setDragState],
  );

  return {
    dragState,
    hoveredEdge,
    handleArrowTipHover,
    handleArrowTipHoverEnd,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
