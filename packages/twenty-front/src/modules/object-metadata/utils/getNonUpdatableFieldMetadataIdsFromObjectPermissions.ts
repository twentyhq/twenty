import { RestrictedField } from 'twenty-shared/types';
import { ObjectPermission } from '~/generated/graphql';

export const getNonUpdatableFieldMetadataIdsFromObjectPermissions = ({
  objectPermissions,
}: {
  objectPermissions: ObjectPermission;
}) => {
  const restrictedFields = objectPermissions.restrictedFields;

  return Object.entries(restrictedFields ?? {})
    .filter(
      ([_fieldMetadataId, restrictedField]) =>
        (restrictedField as RestrictedField).canUpdate === false,
    )
    .map(([fieldMetadataId]) => fieldMetadataId);
};
