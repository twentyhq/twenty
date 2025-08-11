import { type ObjectPermissions } from 'twenty-shared/types';

type GetNonUpdatableFieldMetadataIdsFromObjectPermissionsArgs = {
  objectPermissions: ObjectPermissions;
};

export const getNonUpdatableFieldMetadataIdsFromObjectPermissions = ({
  objectPermissions,
}: GetNonUpdatableFieldMetadataIdsFromObjectPermissionsArgs): string[] => {
  const restrictedFields = objectPermissions.restrictedFields;

  return Object.entries(restrictedFields)
    .filter(([_, restrictedField]) => restrictedField.canUpdate === false)
    .map(([fieldMetadataId]) => fieldMetadataId);
};
