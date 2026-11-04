import isEqual from 'lodash.isequal';
import { type ObjectRecord } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';

// Reads return [] for empty composite sub-fields where merge utils return null
const normalizeEmptyValues = (value: unknown): unknown => {
  if (!hasRecordFieldValue(value)) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeEmptyValues);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, subValue]) => [
        key,
        normalizeEmptyValues(subValue),
      ]),
    );
  }

  return value;
};

export const findRecordKeysChangedByMerge = ({
  mergedData,
  priorityRecord,
  recordKeys,
}: {
  mergedData: Partial<ObjectRecord>;
  priorityRecord: ObjectRecord;
  recordKeys: string[];
}): string[] =>
  recordKeys.filter(
    (recordKey) =>
      recordKey in mergedData &&
      !isEqual(
        normalizeEmptyValues(mergedData[recordKey]),
        normalizeEmptyValues(priorityRecord[recordKey]),
      ),
  );
