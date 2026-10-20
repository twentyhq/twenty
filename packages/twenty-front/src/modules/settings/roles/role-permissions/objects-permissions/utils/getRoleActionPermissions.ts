import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { type SettingsRoleObjectActionPermissions } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectActionPermissions';

export const getRoleActionPermissions = (
  role: Pick<
    RoleWithPartialMembers,
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >,
): SettingsRoleObjectActionPermissions => ({
  canReadObjectRecords: role.canReadAllObjectRecords,
  canUpdateObjectRecords: role.canUpdateAllObjectRecords,
  canSoftDeleteObjectRecords: role.canSoftDeleteAllObjectRecords,
  canDestroyObjectRecords: role.canDestroyAllObjectRecords,
});
