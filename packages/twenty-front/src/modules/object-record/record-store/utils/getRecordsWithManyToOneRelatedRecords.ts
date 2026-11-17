import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

const isRelatedRecord = (value: unknown): value is ObjectRecord =>
  isPlainObject(value) &&
  isNonEmptyString(value.id) &&
  isNonEmptyString(value.__typename);

// Cells such as lookup columns read a related record from its own store entry, as Apollo normalizes it
export const getRecordsWithManyToOneRelatedRecords = (
  records: ObjectRecord[],
): ObjectRecord[] => {
  const relatedRecordById = new Map<string, ObjectRecord>();

  for (const record of records) {
    for (const value of Object.values(record)) {
      if (!isRelatedRecord(value)) {
        continue;
      }

      // Two relations can reach one record with different selected fields
      relatedRecordById.set(value.id, {
        ...relatedRecordById.get(value.id),
        ...value,
      });
    }
  }

  return [...records, ...relatedRecordById.values()];
};
