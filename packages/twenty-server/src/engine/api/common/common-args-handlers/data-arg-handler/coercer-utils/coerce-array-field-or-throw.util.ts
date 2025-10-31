import { inspect } from 'util';

import { isNull } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/common-data-coercer.exception';

export const coerceArrayFieldOrThrow = (
  value: unknown,
  fieldName?: string,
): unknown[] | null => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (
      !Array.isArray(parsedValue) ||
      parsedValue.some((item) => typeof item !== 'string')
    ) {
      throw new CommonDataCoercerException(
        `Invalid value ${inspect(value)} for field "${fieldName}"`,
        CommonDataCoercerExceptionCode.INVALID_ARRAY,
      );
    }

    if (parsedValue.length === 0) return null;

    return value as unknown[];
  } catch {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for array field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_ARRAY,
    );
  }
};
