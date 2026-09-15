import { isNonEmptyString } from './is-non-empty-string.util';

export const getString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
