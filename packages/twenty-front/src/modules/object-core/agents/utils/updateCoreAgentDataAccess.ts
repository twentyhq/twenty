import { type CoreAgentDataAccessScope } from '@/object-core/agents/types/CoreAgentDataAccessScope';
import { applyObjectPermissionChange } from '@/settings/roles/role-permissions/object-level-permissions/utils/applyObjectPermissionChange';
import { getRoleWithUpsertedObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/utils/getRoleWithUpsertedObjectPermission';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const updateCoreAgentDataAccess = ({
  role,
  scope,
  permissionKey,
  value,
}: {
  role: RoleWithPartialMembers;
  scope: CoreAgentDataAccessScope;
  permissionKey: SettingsRoleObjectPermissionKey;
  value: boolean | null;
}): RoleWithPartialMembers => {
  if (scope.type === 'object') {
    const objectPermission = role.objectPermissions?.find(
      (permission) => permission.objectMetadataId === scope.objectMetadataId,
    ) ?? { objectMetadataId: scope.objectMetadataId };

    return getRoleWithUpsertedObjectPermission(
      role,
      applyObjectPermissionChange({ objectPermission, permissionKey, value }),
    );
  }

  if (!isDefined(value)) {
    return role;
  }

  const permissions = applyObjectPermissionChange({
    objectPermission: {
      canReadObjectRecords: role.canReadAllObjectRecords,
      canUpdateObjectRecords: role.canUpdateAllObjectRecords,
      canSoftDeleteObjectRecords: role.canSoftDeleteAllObjectRecords,
      canDestroyObjectRecords: role.canDestroyAllObjectRecords,
    },
    permissionKey,
    value,
  });

  return {
    ...role,
    canReadAllObjectRecords: permissions.canReadObjectRecords,
    canUpdateAllObjectRecords: permissions.canUpdateObjectRecords,
    canSoftDeleteAllObjectRecords: permissions.canSoftDeleteObjectRecords,
    canDestroyAllObjectRecords: permissions.canDestroyObjectRecords,
  };
};
