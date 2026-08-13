import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const normalizeOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
