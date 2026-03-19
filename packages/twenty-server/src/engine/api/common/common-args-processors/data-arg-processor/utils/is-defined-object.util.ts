import { isDefined } from 'twenty-shared/utils';

export const isDefinedObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return isDefined(value) && typeof value === 'object';
};
