import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

export const selectPriorityFieldValue = <T>(
  recordsWithValues: { value: T; recordId: string }[],
  priorityRecordId: string,
): T | null => {
  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (priorityRecord && hasRecordFieldValue(priorityRecord.value)) {
    return priorityRecord.value;
  }

  const fallbackRecord = recordsWithValues.find((record) =>
    hasRecordFieldValue(record.value),
  );

  return fallbackRecord ? fallbackRecord.value : null;
};
