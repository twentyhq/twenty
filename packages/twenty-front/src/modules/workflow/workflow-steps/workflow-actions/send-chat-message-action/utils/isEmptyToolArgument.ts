import { isDefined } from 'twenty-shared/utils';

export const isEmptyToolArgument = (value: unknown): boolean =>
  !isDefined(value) ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);
