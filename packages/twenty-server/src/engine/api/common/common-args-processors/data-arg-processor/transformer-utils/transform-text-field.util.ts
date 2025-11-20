import { isNonEmptyString } from '@sniptt/guards';

export const transformTextField = (
  value: string | null,
  isNullEquivalenceEnabled: boolean = false,
): string | null => {
  return isNullEquivalenceEnabled && !isNonEmptyString(value) ? null : value;
};
