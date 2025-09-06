import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

type RecordWithValue<T> = { value: T; recordId: string };

export const mergeArrayFieldValues = <T>(
  recordsWithValues: RecordWithValue<T>[],
): T[] | null => {
  const allValues: T[] = [];

  recordsWithValues.forEach((record) => {
    if (Array.isArray(record.value)) {
      allValues.push(
        ...record.value.filter((value) => hasRecordFieldValue(value)),
      );
    }
  });

  const uniqueValues = allValues.filter((value, index, array) => {
    const firstIndex = array.findIndex(
      (item) => JSON.stringify(item) === JSON.stringify(value),
    );

    return firstIndex === index;
  });

  return uniqueValues.length > 0 ? uniqueValues : null;
};
