import { isUndefined } from '@sniptt/guards';

export const pruneUndefined = <TValue>(
  record: Record<string, TValue | undefined>,
): Record<string, TValue> => {
  const prunedRecord: Record<string, TValue> = {};

  for (const [key, value] of Object.entries(record)) {
    if (!isUndefined(value)) {
      prunedRecord[key] = value;
    }
  }

  return prunedRecord;
};
