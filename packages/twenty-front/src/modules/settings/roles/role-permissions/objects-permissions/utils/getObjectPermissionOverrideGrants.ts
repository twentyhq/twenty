import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// Without See, changes are denied explicitly: inheriting one later would fail server validation
export const getObjectPermissionOverrideGrants = ({
  role,
  grantedKeys,
}: {
  role: Pick<
    RoleWithPartialMembers,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  grantedKeys: SettingsRoleObjectPermissionKey[];
}): Record<SettingsRoleObjectPermissionKey, boolean | null> => {
  const isReadDeniedByOverride =
    !grantedKeys.includes('canReadObjectRecords') &&
    role.canReadAllObjectRecords;

  const getGrant = (key: SettingsRoleObjectPermissionKey) => {
    const isGranted = grantedKeys.includes(key);
    const allObjectsGrant =
      role[
        SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
          key
        ]
      ];

    return isGranted === allObjectsGrant && !isReadDeniedByOverride
      ? null
      : isGranted;
  };

  const changeGrants = {
    canUpdateObjectRecords: getGrant('canUpdateObjectRecords'),
    canSoftDeleteObjectRecords: getGrant('canSoftDeleteObjectRecords'),
    canDestroyObjectRecords: getGrant('canDestroyObjectRecords'),
  };

  // A change granted by the override needs See granted by it too, or dropping See for all objects leaves a write without read
  const hasChangeGrantedByOverride = Object.values(changeGrants).includes(true);

  return {
    canReadObjectRecords: hasChangeGrantedByOverride
      ? true
      : getGrant('canReadObjectRecords'),
    ...changeGrants,
  };
};
