import isEqual from 'lodash.isequal';
import { type ObjectRecord } from 'twenty-shared/types';

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
      !isEqual(mergedData[recordKey], priorityRecord[recordKey]),
  );
