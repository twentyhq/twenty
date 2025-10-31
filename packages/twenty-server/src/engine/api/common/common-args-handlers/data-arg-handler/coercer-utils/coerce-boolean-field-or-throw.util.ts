import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

export const coerceBooleanFieldOrThrow = (
  value: unknown,
  fieldName?: string,
): boolean | null => {
  if (typeof value !== 'boolean' && !isNull(value))
    throw new CommonDataCoercerException(
      `Invalid boolean value ${inspect(value)} for field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_BOOLEAN,
    );

  return value;
};
