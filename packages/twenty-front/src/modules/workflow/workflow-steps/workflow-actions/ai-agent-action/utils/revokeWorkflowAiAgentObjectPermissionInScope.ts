import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentAllObjectsPermissionKeys';

const CRUD_PERMISSION_KEYS = CRUD_PERMISSIONS.map(({ key }) => key);

// a revoked action is denied explicitly only while an all-objects grant would otherwise cover it;
// revoking reading revokes every action, since none works without it
export const revokeWorkflowAiAgentObjectPermissionInScope = ({
  scope,
  objectUniversalIdentifier,
  permissionKey,
}: {
  scope: AiRunScope | undefined;
  objectUniversalIdentifier: string;
  permissionKey: SettingsRoleObjectPermissionKey;
}): AiRunScope => {
  const objectPermissions = scope?.objectPermissions ?? [];
  const existingObjectPermission = objectPermissions.find(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier === objectUniversalIdentifier,
  );
  const revokedPermissionKeys =
    permissionKey === 'canReadObjectRecords'
      ? CRUD_PERMISSION_KEYS
      : [permissionKey];
  const updatedObjectPermission = { ...existingObjectPermission };

  for (const revokedPermissionKey of revokedPermissionKeys) {
    if (
      scope?.[
        WORKFLOW_AI_AGENT_ALL_OBJECTS_PERMISSION_KEYS[revokedPermissionKey]
      ] ??
      false
    ) {
      updatedObjectPermission[revokedPermissionKey] = false;
    } else {
      delete updatedObjectPermission[revokedPermissionKey];
    }
  }

  const hasAnyAction = CRUD_PERMISSION_KEYS.some((key) =>
    isDefined(updatedObjectPermission[key]),
  );

  return {
    ...scope,
    objectPermissions: [
      ...objectPermissions.filter(
        (objectPermission) => objectPermission !== existingObjectPermission,
      ),
      ...(hasAnyAction
        ? [{ ...updatedObjectPermission, objectUniversalIdentifier }]
        : []),
    ],
  };
};
