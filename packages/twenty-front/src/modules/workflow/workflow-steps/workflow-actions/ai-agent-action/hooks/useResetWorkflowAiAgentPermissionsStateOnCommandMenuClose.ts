import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

export const useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose = () => {
  const resetSelectedObjectId = useResetRecoilState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const setIsAddingPermission = useSetRecoilState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );
  const resetAgentState = useResetRecoilState(workflowAiAgentActionAgentState);

  const resetPermissionState = () => {
    resetSelectedObjectId();
    setIsAddingPermission(false);
    resetAgentState();
  };

  useListenToSidePanelClosing(resetPermissionState);

  return {
    resetPermissionState,
  };
};
