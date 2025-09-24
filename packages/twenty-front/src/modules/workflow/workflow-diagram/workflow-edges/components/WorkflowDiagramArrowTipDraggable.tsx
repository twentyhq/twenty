import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { useArrowTipInteractions } from '@/workflow/workflow-diagram/workflow-edges/hooks/useArrowTipInteractions';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { useCreateEdge } from '@/workflow/workflow-steps/hooks/useCreateEdge';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { ApolloError } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useReactFlow } from '@xyflow/react';
import { type MouseEvent, useCallback } from 'react';

const StyledArrowTipContainer = styled.div<{
  x: number;
  y: number;
  isDragging: boolean;
  isHovered: boolean;
}>`
  position: absolute;
  left: ${({ x }) => x - 12}px;
  top: ${({ y }) => y - 12}px;
  width: 24px;
  height: 24px;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'pointer')};
  z-index: ${({ isHovered, isDragging }) =>
    isHovered || isDragging ? 100 : 10};
  pointer-events: auto;

  &:hover {
    z-index: 100;
  }
`;

const StyledArrowTipHitArea = styled.div<{
  isHovered: boolean;
}>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: transparent;
  &.nodrag {
    pointer-events: auto;
  }
  &.nopan {
    pointer-events: auto;
  }
`;

const StyledDragPreview = styled.svg<{
  isDragging: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 99;
  display: ${({ isDragging }) => (isDragging ? 'block' : 'none')};
`;

type WorkflowDiagramArrowTipDraggableProps = {
  edgeDescriptor: WorkflowDiagramEdgeDescriptor;
  targetX: number;
  targetY: number;
};

export const WorkflowDiagramArrowTipDraggable = ({
  edgeDescriptor,
  targetX,
  targetY,
}: WorkflowDiagramArrowTipDraggableProps) => {
  const theme = useTheme();
  const reactflow = useReactFlow();
  const { createEdge } = useCreateEdge();
  const { deleteEdge } = useDeleteEdge();
  const { enqueueErrorSnackBar } = useSnackBar();

  const {
    dragState,
    hoveredEdge,
    handleArrowTipHover,
    handleArrowTipHoverEnd,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useArrowTipInteractions();

  // Checks if a specific edge is being dragged or hovered
  const isCurrentEdgeDragging =
    dragState.draggedEdge?.source === edgeDescriptor.source &&
    dragState.draggedEdge?.sourceHandle === edgeDescriptor.sourceHandle &&
    dragState.draggedEdge?.target === edgeDescriptor.target &&
    dragState.draggedEdge?.targetHandle === edgeDescriptor.targetHandle;

  const isCurrentEdgeHovered =
    hoveredEdge?.source === edgeDescriptor.source &&
    hoveredEdge?.sourceHandle === edgeDescriptor.sourceHandle &&
    hoveredEdge?.target === edgeDescriptor.target &&
    hoveredEdge?.targetHandle === edgeDescriptor.targetHandle;

  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleArrowTipHover(edgeDescriptor);
    },
    [edgeDescriptor, handleArrowTipHover],
  );

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleArrowTipHoverEnd();
    },
    [handleArrowTipHoverEnd],
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const mousePosition = { x: event.clientX, y: event.clientY };
      const targetPosition = { x: targetX, y: targetY };

      const dragData = handleDragStart(
        edgeDescriptor,
        mousePosition,
        targetPosition,
      );
      if (!dragData) return;

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const currentMouse = { x: moveEvent.clientX, y: moveEvent.clientY };
        handleDragMove(
          dragData.mouseStart,
          currentMouse,
          targetPosition,
          dragData.sourcePosition,
        );
      };

      const handleMouseUp = async (upEvent: globalThis.MouseEvent) => {
        handleDragEnd(targetPosition);

        const flowPosition = reactflow.screenToFlowPosition({
          x: upEvent.clientX,
          y: upEvent.clientY,
        });

        const nodes = reactflow.getNodes();
        const targetNode = nodes.find((node) => {
          const nodeRect = {
            x: node.position.x,
            y: node.position.y,
            width: node.measured?.width ?? 200,
            height: node.measured?.height ?? 100,
          };

          return (
            flowPosition.x >= nodeRect.x &&
            flowPosition.x <= nodeRect.x + nodeRect.width &&
            flowPosition.y >= nodeRect.y &&
            flowPosition.y <= nodeRect.y + nodeRect.height
          );
        });

        if (targetNode != null && targetNode.id !== edgeDescriptor.target) {
          try {
            await deleteEdge({
              source: edgeDescriptor.source,
              sourceHandle: edgeDescriptor.sourceHandle,
              target: edgeDescriptor.target,
              targetHandle: edgeDescriptor.targetHandle,
            });

            await createEdge({
              source: edgeDescriptor.source,
              sourceHandle: edgeDescriptor.sourceHandle,
              target: targetNode.id,
              targetHandle: 'left',
            });
          } catch (error) {
            enqueueErrorSnackBar({
              apolloError: error instanceof ApolloError ? error : undefined,
            });
          }
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [
      edgeDescriptor,
      targetX,
      targetY,
      handleDragStart,
      handleDragMove,
      handleDragEnd,
      reactflow,
      createEdge,
      deleteEdge,
      enqueueErrorSnackBar,
    ],
  );

  return (
    <>
      <StyledArrowTipContainer
        x={isCurrentEdgeDragging ? dragState.dragPosition.x : targetX}
        y={isCurrentEdgeDragging ? dragState.dragPosition.y : targetY}
        isDragging={isCurrentEdgeDragging}
        isHovered={isCurrentEdgeHovered || isCurrentEdgeDragging}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      >
        <StyledArrowTipHitArea
          className="nodrag nopan"
          isHovered={isCurrentEdgeHovered || isCurrentEdgeDragging}
        />
      </StyledArrowTipContainer>

      <StyledDragPreview isDragging={isCurrentEdgeDragging}>
        {dragState.previewPath && (
          <path
            d={dragState.previewPath}
            fill="none"
            stroke={theme.color.blue}
            strokeWidth={2}
            strokeDasharray="5,5"
            markerEnd={`url(#${EDGE_BRANCH_ARROW_MARKER.Dragging.markerEnd})`}
          />
        )}
      </StyledDragPreview>
    </>
  );
};
