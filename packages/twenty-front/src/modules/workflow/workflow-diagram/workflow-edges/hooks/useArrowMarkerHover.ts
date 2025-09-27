import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { useReactFlow } from '@xyflow/react';
import { useCallback, useState } from 'react';

export const useArrowMarkerHover = () => {
  const reactflow = useReactFlow();
  const [isArrowHovered, setIsArrowHovered] = useState(false);

  const setArrowMarkerHovered = useCallback(
    ({
      source,
      target,
      sourceHandle,
      targetHandle,
    }: WorkflowDiagramEdgeDescriptor) => {
      setIsArrowHovered(true);

      reactflow.setEdges((edges) =>
        edges.map((edge) => {
          if (
            edge.source === source &&
            edge.sourceHandle === sourceHandle &&
            edge.target === target &&
            edge.targetHandle === targetHandle
          ) {
            return {
              ...edge,
              ...EDGE_BRANCH_ARROW_MARKER.Hover,
            };
          }
          return edge;
        }),
      );
    },
    [reactflow],
  );

  const clearArrowMarkerHover = useCallback(
    ({
      source,
      target,
      sourceHandle,
      targetHandle,
    }: WorkflowDiagramEdgeDescriptor) => {
      setIsArrowHovered(false);

      reactflow.setEdges((edges) =>
        edges.map((edge) => {
          if (
            edge.source === source &&
            edge.sourceHandle === sourceHandle &&
            edge.target === target &&
            edge.targetHandle === targetHandle &&
            edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd
          ) {
            return {
              ...edge,
              ...EDGE_BRANCH_ARROW_MARKER.Default,
            };
          }
          return edge;
        }),
      );
    },
    [reactflow],
  );

  return {
    isArrowHovered,
    setArrowMarkerHovered,
    clearArrowMarkerHover,
  };
};
