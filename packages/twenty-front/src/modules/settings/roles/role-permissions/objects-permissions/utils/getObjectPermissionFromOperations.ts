import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// Without See, changes are denied explicitly: inheriting one later would fail server validation
export const getObjectPermissionFromOperations = ({
  role,
  operations,
}: {
  role: Pick<
    RoleWithPartialMembers,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  operations: SettingsRoleObjectPermissionKey[];
}): Record<SettingsRoleObjectPermissionKey, boolean | null> => {
  const isReadDeniedByOverride =
    !operations.includes('canReadObjectRecords') &&
    role.canReadAllObjectRecords;

  const getObjectPermissionValue = (key: SettingsRoleObjectPermissionKey) => {
    const hasOperation = operations.includes(key);
    const allObjectsGrant =
      role[
        SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
          key
        ]
      ];

    return hasOperation === allObjectsGrant && !isReadDeniedByOverride
      ? null
      : hasOperation;
  };

  const changeOperations = {
    canUpdateObjectRecords: getObjectPermissionValue('canUpdateObjectRecords'),
    canSoftDeleteObjectRecords: getObjectPermissionValue(
      'canSoftDeleteObjectRecords',
    ),
    canDestroyObjectRecords: getObjectPermissionValue(
      'canDestroyObjectRecords',
    ),
  };

  // A change set by the override needs See set by it too, or dropping See for all objects leaves a write without read
  const hasChangeOperationSetByOverride =
    Object.values(changeOperations).includes(true);

  return {
    canReadObjectRecords: hasChangeOperationSetByOverride
      ? true
      : getObjectPermissionValue('canReadObjectRecords'),
    ...changeOperations,
  };
};
