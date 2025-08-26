import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowSelectedEdgeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdge';
import { workflowHoveredEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowHoveredEdgeComponentState';
import { useReactFlow } from '@xyflow/react';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';

export const useEdgeState = () => {
  const reactflow = useReactFlow();

  const [workflowSelectedEdge, setWorkflowSelectedEdge] =
    useRecoilComponentState(workflowSelectedEdgeComponentState);

  const [workflowHoveredEdge, setWorkflowHoveredEdge] = useRecoilComponentState(
    workflowHoveredEdgeComponentState,
  );

  const isSourceSelected = (nodeId: string) => {
    return workflowSelectedEdge?.source === nodeId;
  };

  const isSourceHovered = (nodeId: string) => {
    return workflowHoveredEdge?.source === nodeId;
  };

  const isEdgeSelected = ({ source, target }: WorkflowDiagramEdge) => {
    return isSourceSelected(source) && workflowSelectedEdge?.target === target;
  };

  const isEdgeHovered = ({ source, target }: WorkflowDiagramEdge) => {
    return isSourceHovered(source) && workflowHoveredEdge?.target === target;
  };

  const setEdgeSelected = ({ source, target }: WorkflowDiagramEdge) => {
    if (isEdgeSelected({ source, target })) {
      return;
    }

    setWorkflowSelectedEdge({ source, target });

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.source === source && edge.target === target) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Selected,
          };
        }

        return {
          ...edge,
          ...EDGE_BRANCH_ARROW_MARKER.Default,
        };
      }),
    );
  };

  const setEdgeHovered = ({ source, target }: WorkflowDiagramEdge) => {
    setWorkflowHoveredEdge({ source, target });

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === source &&
          edge.target === target &&
          edge.markerEnd !== EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd
        ) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Hover,
          };
        }

        return edge;
      }),
    );
  };

  const clearEdgeSelected = () => {
    setWorkflowSelectedEdge(undefined);

    reactflow.setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        ...EDGE_BRANCH_ARROW_MARKER.Default,
      })),
    );
  };

  const clearEdgeHover = () => {
    setWorkflowHoveredEdge(undefined);

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Default,
          };
        }

        return edge;
      }),
    );
  };

  return {
    isEdgeSelected,
    isSourceSelected,
    setEdgeSelected,
    clearEdgeSelected,
    isEdgeHovered,
    isSourceHovered,
    setEdgeHovered,
    clearEdgeHover,
  };
};
