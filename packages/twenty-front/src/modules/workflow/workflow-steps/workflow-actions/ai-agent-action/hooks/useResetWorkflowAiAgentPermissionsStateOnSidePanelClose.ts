import { useListenToSidePanelClosing } from '@/ui/layout/side-panel/hooks/useListenToSidePanelClosing';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';

export const useResetWorkflowAiAgentPermissionsStateOnSidePanelClose = () => {
  const setWorkflowAiAgentPermissionsSelectedObjectId = useSetAtomState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const setWorkflowAiAgentPermissionsIsAddingPermission = useSetAtomState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );
  const setWorkflowAiAgentActionAgent = useSetAtomState(
    workflowAiAgentActionAgentState,
  );

  const resetPermissionState = () => {
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentActionAgent(undefined);
  };

  useListenToSidePanelClosing(resetPermissionState);

  return {
    resetPermissionState,
  };
};
