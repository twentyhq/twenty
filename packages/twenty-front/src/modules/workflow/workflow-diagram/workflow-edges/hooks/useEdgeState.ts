import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { workflowArrowTipHoveredEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowArrowTipHoveredEdgeComponentState';
import { workflowDraggedEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowDraggedEdgeComponentState';
import { workflowHoveredEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowHoveredEdgeComponentState';
import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/workflow-edges/states/workflowSelectedEdgeComponentState';
import { type WorkflowDiagramEdgeDescriptor } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeDescriptor';
import { useReactFlow } from '@xyflow/react';

export const useEdgeState = () => {
  const reactflow = useReactFlow();

  const [workflowSelectedEdge, setWorkflowSelectedEdge] =
    useRecoilComponentState(workflowSelectedEdgeComponentState);

  const [workflowHoveredEdge, setWorkflowHoveredEdge] = useRecoilComponentState(
    workflowHoveredEdgeComponentState,
  );

  const [workflowDraggedEdge, setWorkflowDraggedEdge] = useRecoilComponentState(
    workflowDraggedEdgeComponentState,
  );

  const [workflowArrowTipHoveredEdge, setWorkflowArrowTipHoveredEdge] =
    useRecoilComponentState(workflowArrowTipHoveredEdgeComponentState);

  const isSourceSelected = ({
    nodeId,
    sourceHandle,
  }: {
    nodeId: string;
    sourceHandle: string;
  }) => {
    return (
      workflowSelectedEdge?.source === nodeId &&
      workflowSelectedEdge.sourceHandle === sourceHandle
    );
  };

  const isSourceHovered = ({
    nodeId,
    sourceHandle,
  }: {
    nodeId: string;
    sourceHandle: string;
  }) => {
    return (
      workflowHoveredEdge?.source === nodeId &&
      workflowHoveredEdge.sourceHandle === sourceHandle
    );
  };

  const isEdgeSelected = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    return (
      isSourceSelected({ nodeId: source, sourceHandle }) &&
      workflowSelectedEdge?.target === target &&
      workflowSelectedEdge.targetHandle === targetHandle
    );
  };

  const isEdgeHovered = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    if (isArrowTipHovered({ source, target, sourceHandle, targetHandle })) {
      return false;
    }
    return (
      isSourceHovered({ nodeId: source, sourceHandle }) &&
      workflowHoveredEdge?.target === target &&
      workflowHoveredEdge.targetHandle === targetHandle
    );
  };

  const setEdgeSelected = (edgeDescriptor: WorkflowDiagramEdgeDescriptor) => {
    if (isEdgeSelected(edgeDescriptor)) {
      return;
    }

    setWorkflowSelectedEdge(edgeDescriptor);

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

  const setEdgeHovered = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    setWorkflowHoveredEdge({ source, target, sourceHandle, targetHandle });

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === source &&
          edge.sourceHandle === sourceHandle &&
          edge.target === target &&
          edge.targetHandle === targetHandle &&
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

  const isEdgeDragging = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    return (
      workflowDraggedEdge?.source === source &&
      workflowDraggedEdge.sourceHandle === sourceHandle &&
      workflowDraggedEdge.target === target &&
      workflowDraggedEdge.targetHandle === targetHandle
    );
  };

  const setEdgeDragging = (edgeDescriptor: WorkflowDiagramEdgeDescriptor) => {
    if (isEdgeDragging(edgeDescriptor)) {
      return;
    }

    setWorkflowDraggedEdge(edgeDescriptor);

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
  };

  const clearEdgeDragging = () => {
    setWorkflowDraggedEdge(undefined);

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Dragging.markerEnd) {
          return {
            ...edge,
            ...EDGE_BRANCH_ARROW_MARKER.Default,
          };
        }

        return edge;
      }),
    );
  };

  const isArrowTipHovered = ({
    source,
    target,
    sourceHandle,
    targetHandle,
  }: WorkflowDiagramEdgeDescriptor) => {
    return (
      workflowArrowTipHoveredEdge?.source === source &&
      workflowArrowTipHoveredEdge.sourceHandle === sourceHandle &&
      workflowArrowTipHoveredEdge.target === target &&
      workflowArrowTipHoveredEdge.targetHandle === targetHandle
    );
  };

  const setArrowTipHovered = (
    edgeDescriptor: WorkflowDiagramEdgeDescriptor,
  ) => {
    if (isArrowTipHovered(edgeDescriptor)) {
      return;
    }

    setWorkflowArrowTipHoveredEdge(edgeDescriptor);

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
  };

  const clearArrowTipHovered = () => {
    const previouslyHoveredTipEdge = workflowArrowTipHoveredEdge;
    setWorkflowArrowTipHoveredEdge(undefined);

    if (!previouslyHoveredTipEdge) {
      return;
    }

    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === previouslyHoveredTipEdge.source &&
          edge.sourceHandle === previouslyHoveredTipEdge.sourceHandle &&
          edge.target === previouslyHoveredTipEdge.target &&
          edge.targetHandle === previouslyHoveredTipEdge.targetHandle
        ) {
          const isCurrentlyDragging =
            workflowDraggedEdge?.source === edge.source &&
            workflowDraggedEdge.sourceHandle === edge.sourceHandle &&
            workflowDraggedEdge.target === edge.target &&
            workflowDraggedEdge.targetHandle === edge.targetHandle;

          if (!isCurrentlyDragging) {
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
    isEdgeSelected,
    isSourceSelected,
    setEdgeSelected,
    clearEdgeSelected,
    isEdgeHovered,
    isSourceHovered,
    setEdgeHovered,
    clearEdgeHover,
    isEdgeDragging,
    setEdgeDragging,
    clearEdgeDragging,
    isArrowTipHovered,
    setArrowTipHovered,
    clearArrowTipHovered,
  };
};
