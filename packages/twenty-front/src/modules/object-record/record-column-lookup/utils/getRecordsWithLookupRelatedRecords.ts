import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

const isRelatedRecord = (value: unknown): value is ObjectRecord =>
  isPlainObject(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.__typename);

// A lookup cell reads its related record from that record's own store entry, as Apollo normalizes it
export const getRecordsWithLookupRelatedRecords = ({
  records,
  lookupRelationFieldNames,
}: {
  records: ObjectRecord[];
  lookupRelationFieldNames: string[];
}): ObjectRecord[] => {
  if (!isNonEmptyArray(lookupRelationFieldNames)) {
    return records;
  }

  const relatedRecordById = new Map<string, ObjectRecord>();

  for (const record of records) {
    for (const relationFieldName of lookupRelationFieldNames) {
      const relatedRecord = record[relationFieldName];

      if (!isRelatedRecord(relatedRecord)) {
        continue;
      }

      // Two relations can reach one record with different selected fields
      relatedRecordById.set(relatedRecord.id, {
        ...relatedRecordById.get(relatedRecord.id),
        ...relatedRecord,
      });
    }
  }

  return [...records, ...relatedRecordById.values()];
};
