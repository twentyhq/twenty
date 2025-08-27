export const findOrThrow = <T>(
  array: T[],
  predicate: (value: T) => boolean,
): T => {
  const result = array.find(predicate);

  if (!result) {
    throw new Error('Element not found');
  }

  return result;
};
