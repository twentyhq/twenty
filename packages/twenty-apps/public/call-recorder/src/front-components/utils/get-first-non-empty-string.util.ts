import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getFirstNonEmptyString = (
  values: Array<string | null | undefined>,
): string | undefined => values.find(isNonEmptyString)?.trim();
