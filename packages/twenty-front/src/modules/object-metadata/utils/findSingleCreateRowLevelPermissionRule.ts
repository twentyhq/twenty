import {
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';

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
