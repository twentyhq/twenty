import { applyObjectPermissionChange } from '@/settings/roles/role-permissions/object-level-permissions/utils/applyObjectPermissionChange';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type AiRunScope } from 'twenty-shared/ai';
import {
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const applyWorkflowAiAgentScopeObjectPermissionChange = ({
  scope,
  objectUniversalIdentifier,
  permissionKey,
  value,
}: {
  scope: AiRunScope | undefined;
  objectUniversalIdentifier: string | null;
  permissionKey: SettingsRoleObjectPermissionKey;
  value: boolean;
}): AiRunScope => {
  if (!isDefined(objectUniversalIdentifier)) {
    const allObjectsPermission = applyObjectPermissionChange({
      objectPermission: Object.fromEntries(
        OBJECT_PERMISSION_ACTIONS.map((action) => [
          action,
          scope?.[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]],
        ]),
      ),
      permissionKey,
      value,
    });

    return {
      ...scope,
      ...Object.fromEntries(
        OBJECT_PERMISSION_ACTIONS.map((action) => [
          ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
          allObjectsPermission[action] ?? undefined,
        ]),
      ),
    };
  }

  const objectPermissions = scope?.objectPermissions ?? [];
  const existingObjectPermission = objectPermissions.find(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier === objectUniversalIdentifier,
  );

  return {
    ...scope,
    objectPermissions: [
      ...objectPermissions.filter(
        (objectPermission) => objectPermission !== existingObjectPermission,
      ),
      applyObjectPermissionChange({
        objectPermission: existingObjectPermission ?? {
          objectUniversalIdentifier,
        },
        permissionKey,
        value,
      }),
    ],
  };
};
