import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';

export const useCloseRightClickMenu = () => {
  const setWorkflowDiagramRightClickMenuPosition = useSetAtomComponentState(
    workflowDiagramRightClickMenuPositionState,
  );

  const closeRightClickMenu = () => {
    setWorkflowDiagramRightClickMenuPosition(undefined);
  };

  return { closeRightClickMenu };
};
