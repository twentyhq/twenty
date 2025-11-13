import { isNull } from '@sniptt/guards';

export const transformRawJsonField = (
  value: object | null,
  isNullEquivalenceEnabled: boolean = false,
): object | null => {
  return isNullEquivalenceEnabled &&
    !isNull(value) &&
    Object.keys(value).length === 0
    ? null
    : value;
};
