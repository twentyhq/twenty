export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  if (value === null) {
    return true;
  }

  if (Array.isArray(value)) {
    return (
      value.length === 0 ||
      value.every((item) => isNullEquivalentArrayFieldValue(item))
    );
  }

  return typeof value === 'object' && Object.keys(value).length === 0;
};
