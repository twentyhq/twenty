import { isNull } from '@sniptt/guards';
import { isEmptyObject } from 'twenty-shared/utils';

export const isNullEquivalentRawJsonFieldValue = (value: unknown): boolean => {
  if (isNull(value)) return true;

  return isEmptyObject(value);
};
