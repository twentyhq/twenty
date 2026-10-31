export const isShallowEqual = (valueA: unknown, valueB: unknown): boolean => {
  if (Object.is(valueA, valueB)) {
    return true;
  }

  if (
    typeof valueA !== 'object' ||
    valueA === null ||
    typeof valueB !== 'object' ||
    valueB === null
  ) {
    return false;
  }

  if (Array.isArray(valueA) || Array.isArray(valueB)) {
    if (!Array.isArray(valueA) || !Array.isArray(valueB)) {
      return false;
    }

    if (valueA.length !== valueB.length) {
      return false;
    }

    for (let index = 0; index < valueA.length; index++) {
      if (!Object.is(valueA[index], valueB[index])) {
        return false;
      }
    }

    return true;
  }

  const keysA = Object.keys(valueA);
  const keysB = Object.keys(valueB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(valueB, key) ||
      !Object.is(
        (valueA as Record<string, unknown>)[key],
        (valueB as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
};
