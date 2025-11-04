import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceNumberFieldOrThrow = (
  value: unknown,
  fieldName?: string,
): number | null => {
  if (
    (typeof value !== 'number' && !isNull(value)) ||
    (typeof value === 'number' &&
      (isNaN(value) || value === Infinity || value === -Infinity))
  )
    throw new CommonDataCoercerException(
      `Invalid number value ${inspect(value)} for field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_NUMBER,
    );

  return value;
};
