import { isNonEmptyString } from '@twentyhq/recall-utils/utils/is-non-empty-string.util';

export const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];
