import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const normalizeOptionalString = (
  value: string | null | undefined,
): string | undefined => (isNonEmptyString(value) ? value : undefined);
