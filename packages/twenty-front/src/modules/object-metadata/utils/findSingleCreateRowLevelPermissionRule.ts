import {
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';

// Record defaults only follow from row level rules when exactly one of them lets the user create
export const findSingleCreateRowLevelPermissionRule = (
  objectRecordsPermissions: ObjectRecordsPermissions,
): RowLevelRecordsPermissions | undefined => {
  if (objectRecordsPermissions.canCreateAllRecords) {
    return undefined;
  }

  const createRules = (
    objectRecordsPermissions.rowLevelRecordsPermissions ?? []
  ).filter(({ canCreateRecords }) => canCreateRecords);

  return createRules.length === 1 ? createRules[0] : undefined;
};
