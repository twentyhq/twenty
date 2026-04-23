import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const mergeOneToManyRelationships = (
  records: ObjectRecord[],
  fieldName: string,
): ObjectRecord[] => {
  const allRelatedRecords: ObjectRecord[] = [];

  records.forEach((record) => {
    const relationValue = record[fieldName];
    if (Array.isArray(relationValue)) {
      allRelatedRecords.push(...relationValue);
    }
  });

  return allRelatedRecords.filter(
    (record, index, array) =>
      array.findIndex((r) => r.id === record.id) === index,
  );
};
