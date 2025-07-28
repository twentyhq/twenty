import { RestrictedField } from 'twenty-shared/types';
import { ObjectPermission } from '~/generated/graphql';

export const getReadRestrictedFieldMetadataIdsFromObjectPermissions = ({
  objectPermissions,
  objectMetadataId,
}: {
  objectPermissions?: ObjectPermission[] | null;
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
