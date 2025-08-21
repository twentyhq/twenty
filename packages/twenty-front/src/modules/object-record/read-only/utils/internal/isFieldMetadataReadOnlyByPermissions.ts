import { type ObjectPermission } from '~/generated/graphql';

type IsFieldMetadataReadOnlyByPermissionParams = {
  objectPermissions: ObjectPermission;
  fieldMetadataId: string;
};

export const isFieldMetadataReadOnlyByPermissions = ({
  objectPermissions,
  fieldMetadataId,
}: IsFieldMetadataReadOnlyByPermissionParams) => {
  if (objectPermissions.canUpdateObjectRecords === false) {
    return true;
  }

  const fieldMetadataIsRestrictedForUpdate =
    objectPermissions.restrictedFields?.[fieldMetadataId]?.canUpdate === false;

  return fieldMetadataIsRestrictedForUpdate;
};
