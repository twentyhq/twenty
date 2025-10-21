import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const mergeManyToOneRelationship = (
  records: ObjectRecord[],
  fieldName: string,
  priorityIndex?: number,
): ObjectRecord | null => {
  // If priority index is specified, prioritize that record
  if (priorityIndex !== undefined && priorityIndex >= 0 && priorityIndex < records.length) {
    const priorityRecord = records[priorityIndex];
    const priorityValue = priorityRecord[fieldName];

    if (isDefined(priorityValue) && priorityValue !== null) {
      return priorityValue;
    }
  }

  // Fallback to first non-null value
  const firstNonNullValue = records
    .map((record) => record[fieldName])
    .find((value) => isDefined(value) && value !== null);

  return firstNonNullValue || null;
};
