import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { useCallback } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

export const useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose = (
  actionId: string,
) => {
  const resetSelectedObjectId = useResetRecoilState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const setIsAddingPermission = useSetRecoilState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );
  const resetAgentState = useResetRecoilState(
    workflowAiAgentActionAgentState(actionId),
  );

  const resetPermissionState = useCallback(() => {
    resetSelectedObjectId();
    setIsAddingPermission(false);
    resetAgentState();
  }, [resetAgentState, resetSelectedObjectId, setIsAddingPermission]);

  useListenToSidePanelClosing(resetPermissionState);

  return {
    resetWorkflowAiAgentPermissionsStateOnCommandMenuClose:
      resetPermissionState,
  };
};
