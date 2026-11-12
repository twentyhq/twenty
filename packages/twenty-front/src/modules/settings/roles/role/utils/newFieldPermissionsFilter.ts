import { isSameFieldPermissionTarget } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isSameFieldPermissionTarget';
import { type FieldPermission } from '~/generated-metadata/graphql';

export const newFieldPermissionsFilter = (
  dirtyFieldPermission: FieldPermission,
  existingFieldPermissions?: FieldPermission[] | null,
) => {
  const existingFieldPermission = existingFieldPermissions?.find(
    (persistedFieldPermission) =>
      isSameFieldPermissionTarget({
        firstFieldPermission: persistedFieldPermission,
        secondFieldPermission: dirtyFieldPermission,
      }),
  );

  if (!existingFieldPermission) {
    return true;
  }

  return (
    dirtyFieldPermission.canReadFieldValue !==
      existingFieldPermission.canReadFieldValue ||
    dirtyFieldPermission.canUpdateFieldValue !==
      existingFieldPermission.canUpdateFieldValue
  );
};
