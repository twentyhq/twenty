import { workflowSelectedEdgeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedEdgeComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { WorkflowDiagramHandlesSelected } from '@/workflow/workflow-diagram/types/WorkflowDiagramHandlesSelected';

export const useEdgeSelected = () => {
  const [workflowSelectedEdge, setWorkflowSelectedEdge] =
    useRecoilComponentState(workflowSelectedEdgeComponentState);

  const isEdgeSelected = ({
    source,
    target,
  }: {
    source: string;
    target: string;
  }) => {
    return (
      workflowSelectedEdge?.source === source &&
      workflowSelectedEdge?.target === target
    );
  };

  const getNodeHandlesSelectedState = (
    id: string,
  ): WorkflowDiagramHandlesSelected => {
    return {
      topHandle: workflowSelectedEdge?.target === id,
      bottomHandle: workflowSelectedEdge?.source === id,
    };
  };

  const setEdgeSelected = ({
    source,
    target,
  }: {
    source: string;
    target: string;
  }) => {
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
