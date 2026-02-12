import { type FieldPermission } from '~/generated-metadata/graphql';

export const newFieldPermissionsFilter = (
  dirtyFieldPermission: FieldPermission,
  existingFieldPermissions?: FieldPermission[] | null,
) => {
  const existingFieldPermission = existingFieldPermissions?.find(
    (persistedFieldPermission) =>
      persistedFieldPermission.fieldMetadataId ===
      dirtyFieldPermission.fieldMetadataId,
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
