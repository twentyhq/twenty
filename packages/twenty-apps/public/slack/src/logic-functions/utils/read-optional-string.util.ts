import { isNonEmptyString } from '@sniptt/guards';

export const readOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
