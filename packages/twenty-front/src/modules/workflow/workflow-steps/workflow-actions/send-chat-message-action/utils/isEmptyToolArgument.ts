import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// an empty list stays a value, since clearing a list is how an update empties a field
export const isEmptyToolArgument = (value: unknown): boolean =>
  !isDefined(value) || (isString(value) && value.trim() === '');
