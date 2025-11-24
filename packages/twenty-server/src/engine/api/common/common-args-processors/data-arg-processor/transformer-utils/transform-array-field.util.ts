import { isNull } from '@sniptt/guards';

export const transformArrayField = (
  value: string | string[] | null,
  isNullEquivalenceEnabled: boolean = false,
): string[] | null => {
  if (typeof value === 'string') return [value];

  return isNullEquivalenceEnabled &&
    !isNull(value) &&
    Object.keys(value).length === 0
    ? null
    : value;
};
