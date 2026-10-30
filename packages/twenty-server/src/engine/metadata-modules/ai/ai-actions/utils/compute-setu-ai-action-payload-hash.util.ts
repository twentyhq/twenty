import { createHash } from 'crypto';

import { isPlainObject } from 'twenty-shared/utils';

const toStableJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(toStableJson).join(',')}]`;
  }

  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${toStableJson(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

// Key order must not change the hash, so the same payload always matches
// the revision it was approved as.
export const computeSetuAiActionPayloadHash = (payload: unknown): string =>
  createHash('sha256').update(toStableJson(payload)).digest('hex');
