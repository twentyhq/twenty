import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

type RecordWithValue<T> = { value: T; recordId: string };

export const mergeArrayFieldValues = <T>(
  recordsWithValues: RecordWithValue<T>[],
): T[] | null => {
  const allValues: T[] = [];

  recordsWithValues.forEach((record) => {
    if (record.value === null || record.value === undefined) {
      return;
    }

    if (!Array.isArray(record.value)) {
      throw new Error(
        `Expected array value but received ${typeof record.value}`,
      );
    }

    allValues.push(
      ...record.value.filter((value) => hasRecordFieldValue(value)),
    );
  });

  const uniqueValues = Array.from(new Set(allValues));

  return uniqueValues.length > 0 ? uniqueValues : null;
};
