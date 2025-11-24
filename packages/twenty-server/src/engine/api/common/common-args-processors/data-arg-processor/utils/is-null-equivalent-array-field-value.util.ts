import isEmpty from 'lodash.isempty';

export const isNullEquivalentArrayFieldValue = (value: unknown): boolean => {
  return isEmpty(value) || value === null;
};
