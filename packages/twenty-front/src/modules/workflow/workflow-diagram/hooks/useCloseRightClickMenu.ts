import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useCloseRightClickMenu = () => {
  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentStateV2(
    workflowDiagramRightClickMenuPositionState,
  );

  const closeRightClickMenu = () => {
    setWorkflowDiagramRightClickMenuPosition(undefined);
  };

  return { closeRightClickMenu };
};
