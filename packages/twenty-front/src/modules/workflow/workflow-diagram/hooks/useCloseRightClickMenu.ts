import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';

export const useCloseRightClickMenu = () => {
  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentStateV2(
    workflowDiagramRightClickMenuPositionState,
  );

  const closeRightClickMenu = () => {
    setWorkflowDiagramRightClickMenuPosition(undefined);
  };

  return { closeRightClickMenu };
};
