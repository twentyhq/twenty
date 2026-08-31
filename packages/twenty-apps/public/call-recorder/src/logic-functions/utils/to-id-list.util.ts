import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const toIdList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];
