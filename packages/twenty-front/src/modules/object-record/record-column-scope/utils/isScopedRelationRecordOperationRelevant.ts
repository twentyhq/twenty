import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getWrittenRecord = (
  operation: ObjectRecordOperation,
): ObjectRecord | undefined => {
  if (operation.type === 'create-one') {
    return operation.createdRecord;
  }

  if (operation.type === 'restore-one') {
    return operation.restoredRecord;
  }

  return undefined;
};

export const isScopedRelationRecordOperationRelevant = ({
  operation,
  operationObjectMetadataItemId,
  scopedRelationAliases,
  isRecordLoaded,
}: {
  operation: ObjectRecordOperation;
  operationObjectMetadataItemId: string;
  scopedRelationAliases: (Pick<
    ScopedRelationAlias,
    'relationJoinColumnName'
  > & {
    relationObjectMetadataItem: Pick<
      ScopedRelationAlias['relationObjectMetadataItem'],
      'id'
    >;
  })[];
  isRecordLoaded: (recordId: string) => boolean;
}): boolean => {
  const writtenRecord = getWrittenRecord(operation);

  return scopedRelationAliases.some(
    ({ relationObjectMetadataItem, relationJoinColumnName }) => {
      if (relationObjectMetadataItem.id !== operationObjectMetadataItemId) {
        return false;
      }

      if (
        !isDefined(writtenRecord) ||
        !(relationJoinColumnName in writtenRecord)
      ) {
        return true;
      }

      const parentRecordId = writtenRecord[relationJoinColumnName];

      return isNonEmptyString(parentRecordId) && isRecordLoaded(parentRecordId);
    },
  );
};
