import { type RecordGqlFields } from 'twenty-shared/types';
import { isRecordGqlFieldsRelationWithArguments } from 'twenty-shared/utils';

// A response key is derived from the scope arguments alone, so the selected fields carry a change of looked-up field or summary
export const getScopedRelationColumnQueryFingerprint = (
  scopedRelationRecordGqlFields: RecordGqlFields,
): string =>
  Object.entries(scopedRelationRecordGqlFields)
    .map(([responseKey, scopedRelation]) =>
      [
        responseKey,
        ...(isRecordGqlFieldsRelationWithArguments(scopedRelation)
          ? [
              ...Object.keys(scopedRelation.recordGqlFields),
              ...(scopedRelation.aggregateGqlFieldNames ?? []),
            ].toSorted()
          : []),
      ].join(':'),
    )
    .toSorted()
    .join();
