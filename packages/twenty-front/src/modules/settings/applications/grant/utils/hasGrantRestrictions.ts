import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const hasGrantRestrictions = (
  role: Pick<
    RoleWithPartialMembers,
    'fieldPermissions' | 'rowLevelPermissionPredicates'
  >,
): boolean =>
  (role.fieldPermissions ?? []).some(
    (fieldPermission) =>
      fieldPermission.canReadFieldValue === false ||
      fieldPermission.canUpdateFieldValue === false,
  ) || (role.rowLevelPermissionPredicates ?? []).length > 0;
