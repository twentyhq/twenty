import { RestrictedField } from 'twenty-shared/types';
import { ObjectPermissionsWithRestrictedFields } from '~/generated/graphql';

export const getRestrictedFieldMetadataIdsFromObjectPermissions = ({
  objectPermissions,
  objectMetadataId,
}: {
  objectPermissions?: ObjectPermissionsWithRestrictedFields[] | null;
  objectMetadataId: string;
}) => {
  const restrictedFields = objectPermissions?.find(
    (permission) => permission.objectMetadataId === objectMetadataId,
  )?.restrictedFields;

  return Object.entries(restrictedFields ?? {})
    .filter(
      ([_fieldMetadataId, restrictedField]) =>
        (restrictedField as RestrictedField).canRead === false,
    )
    .map(([fieldMetadataId]) => fieldMetadataId);
};
