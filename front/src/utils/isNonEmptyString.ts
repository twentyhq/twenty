import { isDefined } from './isDefined';

export function isNonEmptyString(
  probableNonEmptyString: string | undefined | null,
): probableNonEmptyString is string {
  if (
    isDefined(probableNonEmptyString) &&
    typeof probableNonEmptyString === 'string' &&
    probableNonEmptyString !== ''
  ) {
    return true;
  }

  return false;
}
