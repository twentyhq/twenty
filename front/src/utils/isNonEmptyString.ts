import { isDefined } from './isDefined';

export const isNonEmptyString = (
  probableNonEmptyString: string | undefined | null,
): probableNonEmptyString is string => {
  if (
    isDefined(probableNonEmptyString) &&
    typeof probableNonEmptyString === 'string' &&
    probableNonEmptyString !== ''
  ) {
    return true;
  }

  return false;
};
