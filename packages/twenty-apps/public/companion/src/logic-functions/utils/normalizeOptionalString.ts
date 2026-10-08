import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';

export const normalizeOptionalString = (
  value: string | null | undefined,
): string | undefined => (isNonEmptyString(value) ? value : undefined);
