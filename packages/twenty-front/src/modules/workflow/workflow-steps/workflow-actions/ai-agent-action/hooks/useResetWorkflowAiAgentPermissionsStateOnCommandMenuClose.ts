import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { workflowAiAgentActionAgentStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentStateV2';
import { workflowAiAgentPermissionsIsAddingPermissionStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionStateV2';
import { workflowAiAgentPermissionsSelectedObjectIdStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdStateV2';

export const useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose = () => {
  const setSelectedObjectId = useSetRecoilStateV2(
    workflowAiAgentPermissionsSelectedObjectIdStateV2,
  );
  const setIsAddingPermission = useSetRecoilStateV2(
    workflowAiAgentPermissionsIsAddingPermissionStateV2,
  );
  const setAgentState = useSetRecoilStateV2(workflowAiAgentActionAgentStateV2);

  const resetPermissionState = () => {
    setSelectedObjectId(undefined);
    setIsAddingPermission(false);
    setAgentState(undefined);
  };

  useListenToSidePanelClosing(resetPermissionState);

  return {
    resetPermissionState,
  };
};
