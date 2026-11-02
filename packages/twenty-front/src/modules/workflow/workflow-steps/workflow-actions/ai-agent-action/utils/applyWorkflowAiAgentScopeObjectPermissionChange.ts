import { applyObjectPermissionChange } from '@/settings/roles/role-permissions/object-level-permissions/utils/applyObjectPermissionChange';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import {
  type AiRunScope,
  type AiRunScopeObjectPermission,
} from 'twenty-shared/ai';
import {
  OBJECT_PERMISSION_ACTIONS,
  ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION,
} from 'twenty-shared/application';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

// removing drops the grant instead of denying it, so a broader grant still applies;
// changing records needs reading them, so removing reading removes every change
export const applyWorkflowAiAgentScopeObjectPermissionChange = ({
  scope = {},
  objectUniversalIdentifier,
  permissionKey,
  isGranted,
}: {
  scope: AiRunScope | undefined;
  objectUniversalIdentifier: string | null;
  permissionKey: SettingsRoleObjectPermissionKey;
  isGranted: boolean;
}): AiRunScope => {
  const removedActions =
    permissionKey === 'canReadObjectRecords'
      ? [...OBJECT_PERMISSION_ACTIONS]
      : [permissionKey];

  if (!isDefined(objectUniversalIdentifier)) {
    if (!isGranted) {
      return removePropertiesFromRecord(
        scope,
        removedActions.map(
          (action) => ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
        ),
      );
    }

    return {
      ...scope,
      [ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[permissionKey]]: true,
      canReadAllObjectRecords: true,
    };
  }

  const otherObjectPermissions = (scope.objectPermissions ?? []).filter(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier !== objectUniversalIdentifier,
  );
  const existingObjectPermission = scope.objectPermissions?.find(
    (objectPermission) =>
      objectPermission.objectUniversalIdentifier === objectUniversalIdentifier,
  ) ?? { objectUniversalIdentifier };

  const changedObjectPermission: AiRunScopeObjectPermission = isGranted
    ? applyObjectPermissionChange({
        objectPermission: existingObjectPermission,
        permissionKey,
        value: true,
      })
    : removePropertiesFromRecord(existingObjectPermission, removedActions);

  const hasRemainingPermission = OBJECT_PERMISSION_ACTIONS.some((action) =>
    isDefined(changedObjectPermission[action]),
  );

  return {
    ...scope,
    objectPermissions: hasRemainingPermission
      ? [...otherObjectPermissions, changedObjectPermission]
      : otherObjectPermissions,
  };
};
