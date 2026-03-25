import { isDefined } from 'twenty-shared/utils';

export const isStepValue = (value: string): boolean => {
  return isDefined(value) && value.includes('/');
};
