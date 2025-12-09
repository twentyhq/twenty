export const isUpdateRecordValueEmpty = (value: any): boolean => {
  if (value == null || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.values(value).every(
      (val) => val === null || val === undefined || val === '',
    );
  }

  return false;
};
