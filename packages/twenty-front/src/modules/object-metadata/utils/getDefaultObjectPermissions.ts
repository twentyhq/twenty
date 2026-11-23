import { type ObjectRecordsPermissions } from 'twenty-shared/types';

// Anything the role does not specify is allowed; the server still enforces the real permissions
export const getDefaultObjectPermissions = (): ObjectRecordsPermissions => ({
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
});
