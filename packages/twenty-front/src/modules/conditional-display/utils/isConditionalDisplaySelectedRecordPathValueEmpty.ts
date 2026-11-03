import {
  isArray,
  isNonEmptyArray,
  isNonEmptyString,
  isString,
} from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const isConditionalDisplaySelectedRecordPathValueEmpty = (
  value: unknown,
): boolean =>
  !isDefined(value) ||
  value === false ||
  (isString(value) && !isNonEmptyString(value)) ||
  (isArray(value) && !isNonEmptyArray(value));
