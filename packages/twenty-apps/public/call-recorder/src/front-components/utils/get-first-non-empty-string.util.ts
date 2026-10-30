import { isNonEmptyString } from '@sniptt/guards';

export const getFirstNonEmptyString = (
  values: Array<string | null | undefined>,
): string | undefined =>
  values
    .map((value) => value?.trim())
    .find((value): value is string => isNonEmptyString(value));
