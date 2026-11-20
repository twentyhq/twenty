import { type RecordGqlFields } from 'twenty-shared/types';
import { isRecordGqlFieldsRelationWithArguments } from 'twenty-shared/utils';

// A response key is derived from the scope arguments alone, so the selected fields carry a change of looked-up field
export const getScopedRelationColumnQueryFingerprint = (
  scopedRelationRecordGqlFields: RecordGqlFields,
): string =>
  Object.entries(scopedRelationRecordGqlFields)
    .map(([responseKey, scopedRelation]) =>
      [
        responseKey,
        ...(isRecordGqlFieldsRelationWithArguments(scopedRelation)
          ? Object.keys(scopedRelation.recordGqlFields).toSorted()
          : []),
      ].join(':'),
    )
    .toSorted()
    .join();
