export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  if (value === null) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return typeof value === 'object' && Object.keys(value).length === 0;
};
