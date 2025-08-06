import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';

export const useCloseRightClickMenu = () => {
  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentState(
    workflowDiagramRightClickMenuPositionState,
  );

  const closeRightClickMenu = () => {
    setWorkflowDiagramRightClickMenuPosition(undefined);
  };

  return { closeRightClickMenu };
};
