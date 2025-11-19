import { isNull } from '@sniptt/guards';

export const transformRawJsonField = (
  value: object | string | null,
  isNullEquivalenceEnabled: boolean = false,
): object | null => {
  if (
    isNullEquivalenceEnabled &&
    !isNull(value) &&
    Object.keys(value).length === 0
  ) {
    return null;
  }
  if (typeof value === 'string') {
    return JSON.parse(value);
  }

  return value;
};
