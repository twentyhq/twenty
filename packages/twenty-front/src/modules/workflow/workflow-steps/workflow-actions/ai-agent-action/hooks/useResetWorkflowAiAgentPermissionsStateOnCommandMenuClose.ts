import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { useCallback } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

export const useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose = () => {
  const resetSelectedObjectId = useResetRecoilState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const setIsAddingPermission = useSetRecoilState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );

  const resetPermissionState = useCallback(() => {
    resetSelectedObjectId();
    setIsAddingPermission(false);
  }, [resetSelectedObjectId, setIsAddingPermission]);

  useListenToSidePanelClosing(resetPermissionState);

  return {
    resetWorkflowAiAgentPermissionsStateOnCommandMenuClose:
      resetPermissionState,
  };
};
