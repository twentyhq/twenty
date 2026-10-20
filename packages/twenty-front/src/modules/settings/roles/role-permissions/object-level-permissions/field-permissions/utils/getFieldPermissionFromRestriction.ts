import { type SettingsRoleFieldRestriction } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/types/SettingsRoleFieldRestriction';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const getFieldPermissionFromRestriction = ({
  fieldPermission,
  restriction,
}: {
  fieldPermission: FieldPermission;
  restriction: SettingsRoleFieldRestriction;
}): FieldPermission => ({
  ...fieldPermission,
  canReadFieldValue: restriction === 'CANNOT_SEE' ? false : null,
  canUpdateFieldValue: false,
});
