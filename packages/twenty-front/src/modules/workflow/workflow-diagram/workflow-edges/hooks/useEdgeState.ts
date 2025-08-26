import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowSelectedEdgeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { type WorkflowDiagramNodeHandles } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeHandles';
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

  const isEdgeSelected = ({ source, target }: WorkflowDiagramEdge) => {
    return (
      workflowSelectedEdge?.source === source &&
      workflowSelectedEdge?.target === target
    );
  };

  const isEdgeHovered = ({ source, target }: WorkflowDiagramEdge) => {
    return (
      workflowHoveredEdge?.source === source &&
      workflowHoveredEdge?.target === target
    );
  };

  const getNodeHandlesSelectedState = (
    id: string,
  ): WorkflowDiagramNodeHandles => {
    return {
      targetHandle: workflowSelectedEdge?.target === id,
      sourceHandle: workflowSelectedEdge?.source === id,
    };
  };

  const getNodeHandlesHoveredState = (
    id: string,
  ): WorkflowDiagramNodeHandles => {
    return {
      targetHandle: workflowHoveredEdge?.target === id,
      sourceHandle: workflowHoveredEdge?.source === id,
    };
  };

  const setEdgeSelected = ({ source, target }: WorkflowDiagramEdge) => {
    if (
      workflowSelectedEdge?.source === source &&
      workflowSelectedEdge?.target === target
    ) {
      return;
    }

    setWorkflowSelectedEdge({ source, target });

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (!(edge.source === source && edge.target === target)) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Default,
          };
        }

        return {
          ...edge,
          ...EDGE_BRANCH_ARROW_MARKER.Selected,
        };
      }),
    );
  };

  const setEdgeHovered = ({ source, target }: WorkflowDiagramEdge) => {
    if (
      workflowHoveredEdge?.source === source &&
      workflowHoveredEdge?.target === target
    ) {
      return;
    }

    setWorkflowHoveredEdge({ source, target });

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          !(
            edge.source === source &&
            edge.target === target &&
            edge.markerEnd !== EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd
          )
        ) {
          return edge;
        }

        return {
          ...edge,
          ...EDGE_BRANCH_ARROW_MARKER.Hover,
        };
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
      edges.map((edge) =>
        edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd
          ? {
              ...edge,
              ...EDGE_BRANCH_ARROW_MARKER.Default,
            }
          : edge,
      ),
    );
  };

  return {
    isEdgeSelected,
    setEdgeSelected,
    clearEdgeSelected,
    getNodeHandlesSelectedState,
    isEdgeHovered,
    setEdgeHovered,
    clearEdgeHover,
    getNodeHandlesHoveredState,
  };
};
