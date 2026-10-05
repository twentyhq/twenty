import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';

export const getString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
