import { workflowHoveredEdgeIdComponentState } from '@/workflow/workflow-diagram/states/workflowHoveredEdgeIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

export const useIsEdgeHovered = () => {
  const [workflowHoveredEdgeId, setWorkflowHoveredEdgeId] =
    useRecoilComponentStateV2(workflowHoveredEdgeIdComponentState);

  const isEdgeHovered = (edgeId: string) => {
    return workflowHoveredEdgeId === edgeId;
  };

  const setEdgeHovered = (edgeId: string) => {
    setWorkflowHoveredEdgeId(edgeId);
  };

  const setNoEdgeHovered = () => {
    setWorkflowHoveredEdgeId(undefined);
  };

  return { isEdgeHovered, setEdgeHovered, setNoEdgeHovered };
};
