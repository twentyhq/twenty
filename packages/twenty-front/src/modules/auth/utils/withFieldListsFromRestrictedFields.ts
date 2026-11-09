import { type CurrentUserWorkspace } from '@/auth/states/currentUserWorkspaceState';
import { isDefined } from 'twenty-shared/utils';

type PersistedObjectRecordsPermissions =
  CurrentUserWorkspace['objectRecordsPermissions'][number];

export const withFieldListsFromRestrictedFields = (
  objectRecordsPermissions: PersistedObjectRecordsPermissions,
): PersistedObjectRecordsPermissions => {
  if (
    isDefined(objectRecordsPermissions.unreadableFields) &&
    isDefined(objectRecordsPermissions.uneditableFields)
  ) {
    return objectRecordsPermissions;
  }

  const restrictedFields = Object.entries(
    objectRecordsPermissions.restrictedFields ?? {},
  );
  const unreadableFields = restrictedFields
    .filter(([, { canRead }]) => canRead === false)
    .map(([fieldMetadataId]) => fieldMetadataId);
  const nonUpdatableFields = restrictedFields
    .filter(([, { canUpdate }]) => canUpdate === false)
    .map(([fieldMetadataId]) => fieldMetadataId);

  return {
    ...objectRecordsPermissions,
    unreadableFields,
    uneditableFields: [
      ...new Set([...unreadableFields, ...nonUpdatableFields]),
    ],
  };
};
