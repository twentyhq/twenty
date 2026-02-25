import { useListenToSidePanelClosing } from '@/ui/layout/right-drawer/hooks/useListenToSidePanelClosing';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentActionAgentStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentStateV2';
import { workflowAiAgentPermissionsIsAddingPermissionStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionStateV2';
import { workflowAiAgentPermissionsSelectedObjectIdStateV2 } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdStateV2';

export const useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose = () => {
  const setSelectedObjectId = useSetAtomState(
    workflowAiAgentPermissionsSelectedObjectIdStateV2,
  );
  const setIsAddingPermission = useSetAtomState(
    workflowAiAgentPermissionsIsAddingPermissionStateV2,
  );
  const setAgentState = useSetAtomState(workflowAiAgentActionAgentStateV2);

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
