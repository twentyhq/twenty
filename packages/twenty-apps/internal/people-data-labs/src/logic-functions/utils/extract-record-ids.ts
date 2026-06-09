import { isNonEmptyString } from '@sniptt/guards';

import { type RecordInput } from 'src/types/bulk-enrich-input';

export const extractRecordIds = (
  records: RecordInput | RecordInput[],
): string[] => {
  const list =
    records === null || records === undefined
      ? []
      : Array.isArray(records)
        ? records
        : [records];

  return list
    .map((record) => (typeof record === 'string' ? record : record?.id))
    .filter((id): id is string => isNonEmptyString(id));
};
