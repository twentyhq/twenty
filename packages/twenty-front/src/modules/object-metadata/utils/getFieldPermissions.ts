import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';

type GetFieldPermissionsArgs = {
  objectPermissions: Pick<
    ObjectRecordsPermissionsWithObjectMetadataId,
    'restrictedFields'
  >;
  fieldMetadataId: string;
};

export const getFieldPermissions = ({
  objectPermissions,
  fieldMetadataId,
}: GetFieldPermissionsArgs) => {
  const restrictedField = objectPermissions.restrictedFields[fieldMetadataId];

  return {
    canReadField: restrictedField?.canRead !== false,
    canUpdateField: restrictedField?.canUpdate !== false,
  };
};
