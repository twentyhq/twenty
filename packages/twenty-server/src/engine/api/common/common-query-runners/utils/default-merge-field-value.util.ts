import { isDefined } from 'twenty-shared/utils';

import { hasRecordFieldValue } from 'src/engine/api/common/utils/has-record-field-value.util';

export const defaultMergeFieldValue = <TValue>(
  recordsWithValues: { value: TValue; recordId: string }[],
  priorityRecordId: string,
  hasValue: (value: TValue) => boolean = hasRecordFieldValue,
): TValue | null => {
  const priorityRecord = recordsWithValues.find(
    (record) => record.recordId === priorityRecordId,
  );

  if (isDefined(priorityRecord) && hasValue(priorityRecord.value)) {
    return priorityRecord.value;
  }

  const fallbackRecord = recordsWithValues.find((record) =>
    hasValue(record.value),
  );

  if (isDefined(fallbackRecord)) {
    return fallbackRecord.value;
  }

  return priorityRecord?.value ?? null;
};
