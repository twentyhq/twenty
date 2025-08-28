import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { workflowHoveredEdgeIdComponentState } from '@/workflow/workflow-diagram/states/workflowHoveredEdgeIdComponentState';

export const useEdgeHovered = () => {
  const [workflowHoveredEdgeId, setWorkflowHoveredEdgeId] =
    useRecoilComponentState(workflowHoveredEdgeIdComponentState);

  const isEdgeHovered = (edgeId: string) => {
    return workflowHoveredEdgeId === edgeId;
  };

  const setEdgeHovered = (edgeId: string) => {
    setWorkflowHoveredEdgeId(edgeId);
  };

  const setNoEdgeHovered = () => {
    setWorkflowHoveredEdgeId(undefined);
  };

  return {
    isEdgeHovered,
    setEdgeHovered,
    setNoEdgeHovered,
  };
};
