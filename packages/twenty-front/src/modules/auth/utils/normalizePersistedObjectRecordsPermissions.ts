import { type CurrentUserWorkspace } from '@/auth/states/currentUserWorkspaceState';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ObjectRecordsPermissions =
  CurrentUserWorkspace['objectRecordsPermissions'][number];

// TODO(@charlesBochet): remove once values persisted before 2.58 (single row level rule object) are gone
type PersistedObjectRecordsPermissions = Omit<
  ObjectRecordsPermissions,
  'rowLevelRecordsPermissions'
> & {
  rowLevelRecordsPermissions?:
    | ObjectRecordsPermissions['rowLevelRecordsPermissions']
    | Record<string, unknown>;
};

const withRowLevelRecordsPermissionsList = ({
  rowLevelRecordsPermissions,
  ...objectRecordsPermissions
}: PersistedObjectRecordsPermissions): ObjectRecordsPermissions => {
  if (!isDefined(rowLevelRecordsPermissions)) {
    return objectRecordsPermissions;
  }

  return {
    ...objectRecordsPermissions,
    rowLevelRecordsPermissions: isArray(rowLevelRecordsPermissions)
      ? rowLevelRecordsPermissions
      : null,
  };
};

const withFieldListsFromRestrictedFields = (
  objectRecordsPermissions: ObjectRecordsPermissions,
): ObjectRecordsPermissions => {
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

export const normalizePersistedObjectRecordsPermissions = (
  objectRecordsPermissions: PersistedObjectRecordsPermissions,
): ObjectRecordsPermissions =>
  withFieldListsFromRestrictedFields(
    withRowLevelRecordsPermissionsList(objectRecordsPermissions),
  );
