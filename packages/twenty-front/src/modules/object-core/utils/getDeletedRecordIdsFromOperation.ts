import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

export const getDeletedRecordIdsFromOperation = (
  operation: ObjectRecordOperation,
): string[] => {
  if (operation.type === 'delete-many') {
    return operation.deletedRecordIds;
  }

  if (operation.type === 'delete-one') {
    return [operation.deletedRecordId];
  }

  return [];
};
