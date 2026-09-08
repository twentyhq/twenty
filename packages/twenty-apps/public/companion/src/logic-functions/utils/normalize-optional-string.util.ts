import { isNonEmptyString } from '@twentyhq/recall-utils/utils/is-non-empty-string.util';

export const normalizeOptionalString = (
  value: string | null | undefined,
): string | undefined => (isNonEmptyString(value) ? value : undefined);
