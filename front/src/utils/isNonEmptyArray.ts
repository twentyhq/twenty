export function isNonEmptyArray<T>(
  probableArray: T[] | undefined | null,
): probableArray is NonNullable<T[]> {
  if (
    Array.isArray(probableArray) &&
    probableArray.length &&
    probableArray.length > 0
  ) {
    return true;
  }

  return false;
}
