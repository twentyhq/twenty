export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  return value === null ||
    (
      Array.isArray(value)) &&
      (value.length === 0 || value.every((item) => isNullEquivalentArrayFieldValue(item))
    ) ||
    (typeof value === 'object' && Object.keys(value).length === 0);
};
