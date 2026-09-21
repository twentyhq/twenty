import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

export const doesObjectRecordOperationTargetRecordId = ({
  operation,
  recordId,
}: {
  operation: ObjectRecordOperation;
  recordId: string;
}): boolean => {
  switch (operation.type) {
    case 'delete-one':
      return operation.deletedRecordId === recordId;
    case 'delete-many':
      return operation.deletedRecordIds.includes(recordId);
    case 'restore-one':
      return operation.restoredRecord.id === recordId;
    case 'restore-many':
      return operation.restoredRecords.some(
        (restoredRecord) => restoredRecord.id === recordId,
      );
    default:
      return false;
  }
};
