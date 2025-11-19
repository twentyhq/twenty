import { isNull } from '@sniptt/guards';

export const transformRawJsonField = (
  value: object | string | null,
  isNullEquivalenceEnabled: boolean = false,
): object | string | null => {
  return isNullEquivalenceEnabled &&
    !isNull(value) &&
    Object.keys(value).length === 0
    ? null
    : value;
};
