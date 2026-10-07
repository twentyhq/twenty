import { isNull, isNumber } from '@sniptt/guards';

export const isPlanLimitDefaultValue = (
  value: unknown,
): value is number | null =>
  isNull(value) ||
  (isNumber(value) && Number.isSafeInteger(value) && value >= 0);
