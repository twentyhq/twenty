import { isDefined } from 'twenty-shared/utils';

export const isNumericRange = (value: string): boolean => {
  return isDefined(value) && /^\d+(-\d+)?$/.test(value);
};
