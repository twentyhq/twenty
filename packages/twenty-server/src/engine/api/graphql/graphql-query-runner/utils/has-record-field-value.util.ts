export const hasRecordFieldValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  if (typeof value === 'number') {
    return !isNaN(value);
  }

  if (typeof value === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    return Object.values(objectValue).some((val) => hasRecordFieldValue(val));
  }

  return true;
};
