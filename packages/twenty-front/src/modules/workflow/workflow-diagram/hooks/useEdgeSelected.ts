import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedEdgeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { WorkflowDiagramHandlesSelected } from '@/workflow/workflow-diagram/types/WorkflowDiagramHandlesSelected';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagramEdge';

export const useEdgeSelected = () => {
  const [workflowSelectedEdge, setWorkflowSelectedEdge] =
    useRecoilComponentState(workflowSelectedEdgeComponentState);

  const isEdgeSelected = ({ source, target }: WorkflowDiagramEdge) => {
    return (
      workflowSelectedEdge?.source === source &&
      workflowSelectedEdge?.target === target
    );
  };

  const getNodeHandlesSelectedState = (
    id: string,
  ): WorkflowDiagramHandlesSelected => {
    return {
      targetHandle: workflowSelectedEdge?.target === id,
      sourceHandle: workflowSelectedEdge?.source === id,
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

  const clearEdgeSelection = () => {
    setWorkflowSelectedEdge(undefined);
  };

  return {
    isEdgeSelected,
    setEdgeSelected,
    clearEdgeSelection,
    getNodeHandlesSelectedState,
  };
};
