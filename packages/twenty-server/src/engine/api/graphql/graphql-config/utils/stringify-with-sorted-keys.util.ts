import { isPlainObject } from 'twenty-shared/utils';

const sortKeysDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep(value[key])]),
    );
  }

  return value;
};

export const stringifyWithSortedKeys = (value: unknown): string =>
  JSON.stringify(sortKeysDeep(value));
