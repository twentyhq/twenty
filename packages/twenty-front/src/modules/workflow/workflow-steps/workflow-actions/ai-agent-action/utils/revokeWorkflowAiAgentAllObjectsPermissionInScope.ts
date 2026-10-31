import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

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

  // an entry still granting an action keeps the reading it relied on, as the tab showed it
  const objectPermissions = scope?.objectPermissions?.map((objectPermission) =>
    !isDefined(objectPermission.canReadObjectRecords) &&
    (objectPermission.canUpdateObjectRecords ||
      objectPermission.canSoftDeleteObjectRecords ||
      objectPermission.canDestroyObjectRecords)
      ? { ...objectPermission, canReadObjectRecords: true }
      : objectPermission,
  );

  return {
    ...scope,
    ...(isDefined(objectPermissions) ? { objectPermissions } : {}),
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
  };
};
