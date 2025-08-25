import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedEdgeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { type WorkflowDiagramNodeHandles } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeHandles';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagramEdge';
import { workflowHoveredEdgeComponentState } from '@/workflow/workflow-diagram/states/workflowHoveredEdgeComponentState';

export const useEdgeState = () => {
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
  };

  const setEdgeHovered = ({ source, target }: WorkflowDiagramEdge) => {
    if (
      workflowHoveredEdge?.source === source &&
      workflowHoveredEdge?.target === target
    ) {
      return;
    }
    setWorkflowHoveredEdge({ source, target });
  };

  const clearEdgeSelected = () => {
    setWorkflowSelectedEdge(undefined);
  };

  const clearEdgeHover = () => {
    setWorkflowHoveredEdge(undefined);
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
