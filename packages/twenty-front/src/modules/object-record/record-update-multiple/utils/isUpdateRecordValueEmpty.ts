import { isDefined } from 'twenty-shared/utils';

export const isUpdateRecordValueEmpty = (value: unknown): boolean => {
  if (!isDefined(value) || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Date) {
    return false;
  }

  if (typeof value === 'object') {
    return Object.values(value).every(isUpdateRecordValueEmpty);
  }

  return false;
};
