import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';

import { WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentAllObjectsPermissionKeys';

export const revokeWorkflowAiAgentAllObjectsPermissionInScope = ({
  scope,
  permissionKey,
}: {
  scope: AiRunScope | undefined;
  permissionKey: SettingsRoleObjectPermissionKey;
}): AiRunScope => {
  if (permissionKey !== 'canReadObjectRecords') {
    return {
      ...scope,
      [WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS[permissionKey]]: false,
    };
  }

  return {
    ...scope,
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
  };
};
