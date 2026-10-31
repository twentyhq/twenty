import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';

const CRUD_PERMISSION_KEYS = CRUD_PERMISSIONS.map(({ key }) => key);

// an explicit denial is only needed while an all-objects grant would otherwise cover the action
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
        SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
          revokedPermissionKey
        ]
      ] ??
      false
    ) {
      updatedObjectPermission[revokedPermissionKey] = false;
    } else {
      updatedObjectPermission[revokedPermissionKey] = undefined;
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
