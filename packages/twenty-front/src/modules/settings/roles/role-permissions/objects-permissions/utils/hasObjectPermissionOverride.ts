import { isFieldPermissionRestrictive } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldPermissionRestrictive';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { getObjectRowLevelPermissionPredicates } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionPredicates';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// Compared to nothing but the object's own settings, so changing the all-objects access keeps the list stable
export const hasObjectPermissionOverride = ({
  role,
  objectMetadataId,
}: {
  role: Pick<
    RoleWithPartialMembers,
    'objectPermissions' | 'fieldPermissions' | 'rowLevelPermissionPredicates'
  >;
  objectMetadataId: string;
}) => {
  const objectPermission = role.objectPermissions?.find(
    (permission) => permission.objectMetadataId === objectMetadataId,
  );

  const hasObjectGrant = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.some((key) =>
    isDefined(objectPermission?.[key]),
  );

  const hasFieldRestriction = (role.fieldPermissions ?? []).some(
    (fieldPermission) =>
      fieldPermission.objectMetadataId === objectMetadataId &&
      isFieldPermissionRestrictive(fieldPermission),
  );

  return (
    hasObjectGrant ||
    hasFieldRestriction ||
    getObjectRowLevelPermissionPredicates({ role, objectMetadataId }).length > 0
  );
};
