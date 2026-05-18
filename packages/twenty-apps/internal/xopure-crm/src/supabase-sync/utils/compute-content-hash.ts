import { createHash } from 'node:crypto';

const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = sortValue((value as Record<string, unknown>)[key]);
        return accumulator;
      }, {});
  }

  return value;
};

export const stableStringify = (value: unknown): string =>
  JSON.stringify(sortValue(value));

export const computeContentHash = (value: unknown): string =>
  createHash('sha256').update(stableStringify(value)).digest('hex');
