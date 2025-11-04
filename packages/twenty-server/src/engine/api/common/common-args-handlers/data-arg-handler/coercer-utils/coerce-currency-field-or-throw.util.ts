import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';

import { coerceNumericFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-numeric-field-or-throw.util';
import { coerceTextFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-text-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';

export const coerceCurrencyFieldOrThrow = (
  value: unknown,
  fieldName?: string,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw Error;

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);

    for (const subField of subfields) {
      switch (subField) {
        case 'amountMicros':
          coerceNumericFieldOrThrow(
            parsedValue[subField],
            `${fieldName}.${subField}`,
          );
          break;
        case 'currencyCode':
          coerceTextFieldOrThrow(
            parsedValue[subField],
            `${fieldName}.${subField}`,
          );
          break;

        default:
          throw new CommonDataCoercerException(
            `Invalid subfield ${subField}`,
            CommonDataCoercerExceptionCode.INVALID_CURRENCY,
          );
      }
    }

    return value;
  } catch (error) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for currency field "${fieldName}" - ${error.message}`,
      CommonDataCoercerExceptionCode.INVALID_CURRENCY,
    );
  }
};
