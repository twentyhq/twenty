import { isFieldPermissionRestrictive } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldPermissionRestrictive';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// Draft field permissions carry temporary ids and cleared entries the server does not return
export const getFieldRestrictionKeys = ({
  fieldPermissions,
}: Pick<RoleWithPartialMembers, 'fieldPermissions'>) =>
  (fieldPermissions ?? [])
    .filter(isFieldPermissionRestrictive)
    .map(
      (fieldPermission) =>
        `${fieldPermission.fieldMetadataId}:${fieldPermission.rowLevelPermissionPredicateGroupId ?? ''}:${fieldPermission.canReadFieldValue === false}:${fieldPermission.canUpdateFieldValue === false}`,
    )
    .sort();
