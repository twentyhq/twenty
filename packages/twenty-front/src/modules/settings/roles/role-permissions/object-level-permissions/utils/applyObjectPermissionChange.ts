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
  const isChangePermission = permissionKey !== 'canReadObjectRecords';

  return {
    ...objectPermission,
    [permissionKey]: value,
    ...(isChangePermission && value !== false
      ? { canReadObjectRecords: value }
      : {}),
    ...(!isChangePermission && value === false
      ? {
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        }
      : {}),
  };
};
