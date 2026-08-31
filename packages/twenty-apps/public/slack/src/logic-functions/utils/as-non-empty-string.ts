import { isNonEmptyString } from '@sniptt/guards';

export const asNonEmptyString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
