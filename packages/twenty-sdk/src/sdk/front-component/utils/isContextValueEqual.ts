// Not fastDeepEqual from twenty-shared/utils: it sits in a non-tree-shakable
// chunk that adds ~600KB to every front component bundle.
export const isContextValueEqual = (
  firstValue: unknown,
  secondValue: unknown,
): boolean => {
  if (Object.is(firstValue, secondValue)) {
    return true;
  }

  if (
    typeof firstValue !== 'object' ||
    typeof secondValue !== 'object' ||
    firstValue === null ||
    secondValue === null ||
    Array.isArray(firstValue) !== Array.isArray(secondValue)
  ) {
    return false;
  }

  if (Array.isArray(firstValue) && Array.isArray(secondValue)) {
    return (
      firstValue.length === secondValue.length &&
      firstValue.every((item, index) =>
        isContextValueEqual(item, secondValue[index]),
      )
    );
  }

  const firstRecord = firstValue as Record<string, unknown>;
  const secondRecord = secondValue as Record<string, unknown>;
  const firstKeys = Object.keys(firstRecord);

  return (
    firstKeys.length === Object.keys(secondRecord).length &&
    firstKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(secondRecord, key) &&
        isContextValueEqual(firstRecord[key], secondRecord[key]),
    )
  );
};
