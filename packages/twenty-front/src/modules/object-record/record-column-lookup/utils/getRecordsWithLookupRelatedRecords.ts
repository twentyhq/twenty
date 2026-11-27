import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

const isRelatedRecord = (value: unknown): value is ObjectRecord =>
  isPlainObject(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.__typename);

// A lookup cell reads its related records from their own store entries, as Apollo normalizes them
export const getRecordsWithLookupRelatedRecords = ({
  records,
  lookupRelationRecordKeys,
}: {
  records: ObjectRecord[];
  lookupRelationRecordKeys: string[];
}): ObjectRecord[] => {
  if (!isNonEmptyArray(lookupRelationRecordKeys)) {
    return records;
  }

  const relatedRecordById = new Map<string, ObjectRecord>();

  for (const record of records) {
    for (const lookupRelationRecordKey of lookupRelationRecordKeys) {
      const relatedRecords = [record[lookupRelationRecordKey]]
        .flat()
        .filter(isRelatedRecord);

      for (const relatedRecord of relatedRecords) {
        // Two relations can reach one record with different selected fields
        relatedRecordById.set(relatedRecord.id, {
          ...relatedRecordById.get(relatedRecord.id),
          ...relatedRecord,
        });
      }
    }
  }

  return [...records, ...relatedRecordById.values()];
};
