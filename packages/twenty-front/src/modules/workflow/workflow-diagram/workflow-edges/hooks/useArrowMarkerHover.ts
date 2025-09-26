import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';

export const useArrowMarkerHover = () => {
  const reactflow = useReactFlow();
  const [isArrowHovered, setIsArrowHovered] = useState(false);

  const setArrowMarkerHovered = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    setIsArrowHovered(true);
    
    reactflow.setEdges((edges) => {
      
      return edges.map((edge) => {
        
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
      });
    });
  };

  const clearArrowMarkerHover = ({
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
          edge.targetHandle === targetHandle
        ) {
          // Reset hover state - restore to selected if it was selected, otherwise default
          if (edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd) {
            // We need to determine what state to restore to
            // For now, let's restore to default - we can improve this later
            return {
              ...edge,
              ...EDGE_BRANCH_ARROW_MARKER.Default,
            };
          }
        }
        return edge;
      }),
    );
  };

  return {
    isArrowHovered,
    setArrowMarkerHovered,
    clearArrowMarkerHover,
  };
};
