import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceTextFieldOrThrow = (
  value: unknown,
  fieldName?: string,
  isNullEquivalenceEnabled: boolean = false,
): string | null => {
  if (typeof value !== 'string' && !isNull(value))
    throw new CommonDataCoercerException(
      `Invalid string value ${inspect(value)} for text field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_TEXT,
    );

  if (value === '' && isNullEquivalenceEnabled) return null;

  return value;
};
