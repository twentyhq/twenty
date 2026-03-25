import { isNull } from '@sniptt/guards';

export const transformNumericField = (
  value: number | string | null,
): number | null => {
  return isNull(value) ? null : Number(value);
};
