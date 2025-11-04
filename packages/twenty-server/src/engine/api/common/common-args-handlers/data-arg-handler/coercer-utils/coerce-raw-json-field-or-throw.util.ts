import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceRawJsonFieldOrThrow = (
  value: unknown,
  fieldName?: string,
  isNullEquivalenceEnabled: boolean = false,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) {
      throw new CommonDataCoercerException(
        `Invalid value ${inspect(value)} for raw json field "${fieldName}"`,
        CommonDataCoercerExceptionCode.INVALID_RAW_JSON,
      );
    }

    if (Object.keys(parsedValue).length === 0 && isNullEquivalenceEnabled)
      return null;

    return value;
  } catch {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for raw json field "${fieldName}"`,
      CommonDataCoercerExceptionCode.INVALID_RAW_JSON,
    );
  }
};
