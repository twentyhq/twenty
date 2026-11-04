import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';

type ObjectPermissionValues = Partial<
  Record<SettingsRoleObjectPermissionKey, boolean | null>
>;

// changing records needs reading them, so granting a change grants reading and refusing reading refuses every change
export const applyObjectPermissionChange = <TObjectPermission extends object>({
  objectPermission,
  permissionKey,
  value,
}: {
  objectPermission: TObjectPermission;
  permissionKey: SettingsRoleObjectPermissionKey;
  value: boolean | null;
}): TObjectPermission & ObjectPermissionValues => {
  const changedObjectPermission: TObjectPermission & ObjectPermissionValues = {
    ...objectPermission,
    [permissionKey]: value,
  };

  const isReadPermission = permissionKey === 'canReadObjectRecords';

  if (!isReadPermission && value !== false) {
    return { ...changedObjectPermission, canReadObjectRecords: value };
  }

  if (isReadPermission && value === false) {
    return {
      ...changedObjectPermission,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    };
  }

  return changedObjectPermission;
};
