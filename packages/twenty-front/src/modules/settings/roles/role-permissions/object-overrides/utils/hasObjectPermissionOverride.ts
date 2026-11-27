import { hasObjectFieldRestriction } from '@/settings/roles/role-permissions/object-overrides/utils/hasObjectFieldRestriction';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionKeys';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const hasObjectPermissionOverride = ({
  role,
  objectMetadataId,
}: {
  role: Pick<
    RoleWithPartialMembers,
    'objectPermissions' | 'fieldPermissions' | 'rowLevelPermissionRules'
  >;
  objectMetadataId: string;
}) => {
  const objectPermission = role.objectPermissions?.find(
    (permission) => permission.objectMetadataId === objectMetadataId,
  );

  const hasObjectOperation = SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.some((key) =>
    isDefined(objectPermission?.[key]),
  );

  return (
    hasObjectOperation ||
    hasObjectFieldRestriction({ role, objectMetadataId }) ||
    (role.rowLevelPermissionRules ?? []).some(
      (rule) => rule.objectMetadataId === objectMetadataId,
    )
  );
};
