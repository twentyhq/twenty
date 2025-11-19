import { isNull } from '@sniptt/guards';

export const isNullEquivalentRawJsonFieldValue = (value: unknown): boolean => {
  if (isNull(value)) return true;

  return typeof value === 'object' && Object.keys(value).length === 0;
};
