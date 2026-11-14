import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { isDefined } from 'twenty-shared/utils';

const getChangedRecords = (
  operation: ObjectRecordOperation,
): Partial<ObjectRecord>[] | undefined => {
  switch (operation.type) {
    case 'update-one':
    case 'update-many': {
      const updateInputs =
        operation.type === 'update-one'
          ? [operation.result.updateInput]
          : operation.result.updateInputs;

      return updateInputs.map(({ recordId, updatedFields, updatedRecord }) => ({
        ...Object.assign({}, ...updatedFields),
        ...updatedRecord,
        id: recordId,
      }));
    }
    case 'create-one':
      return [operation.createdRecord];
    case 'restore-one':
      return [operation.restoredRecord];
    case 'restore-many':
      return operation.restoredRecords;
    case 'delete-one':
      return [{ id: operation.deletedRecordId }];
    case 'delete-many':
      return operation.deletedRecordIds.map((id) => ({ id }));
    // Only soft-deleted records can be destroyed, and their delete already refreshed the rows
    case 'destroy-one':
    case 'destroy-many':
      return [];
    default:
      return undefined;
  }
};

// A parent is affected when it lists a changed record, or a changed record now points to it
export const getScopedRelationAffectedParentRecordIds = ({
  operation,
  parentRecordIds,
  getParentRecord,
  aliases,
  joinColumnNames,
}: {
  operation: ObjectRecordOperation;
  parentRecordIds: string[];
  getParentRecord: (parentRecordId: string) => ObjectRecord | null | undefined;
  aliases: string[];
  joinColumnNames: string[];
}) => {
  const changedRecords = getChangedRecords(operation);

  if (!isDefined(changedRecords)) {
    return parentRecordIds;
  }

  const changedRecordIds = new Set(changedRecords.map(({ id }) => id));
  const linkedParentRecordIds = new Set(
    changedRecords.flatMap((changedRecord) =>
      joinColumnNames.map((joinColumnName) => changedRecord[joinColumnName]),
    ),
  );

  return parentRecordIds.filter((parentRecordId) => {
    if (linkedParentRecordIds.has(parentRecordId)) {
      return true;
    }

    const parentRecord = getParentRecord(parentRecordId);

    return aliases.some((alias) => {
      const relatedRecords: ObjectRecord[] = parentRecord?.[alias] ?? [];

      return relatedRecords.some((relatedRecord) =>
        changedRecordIds.has(relatedRecord.id),
      );
    });
  });
};
