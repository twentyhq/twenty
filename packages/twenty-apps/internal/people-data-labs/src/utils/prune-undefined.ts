import { isUndefined } from '@sniptt/guards';

export const pruneUndefined = <TValue>(
  record: Record<string, TValue | undefined>,
): Record<string, TValue> => {
  const result: Record<string, TValue> = {};

  for (const [key, value] of Object.entries(record)) {
    if (!isUndefined(value)) {
      result[key] = value;
    }
  }

  return result;
};
