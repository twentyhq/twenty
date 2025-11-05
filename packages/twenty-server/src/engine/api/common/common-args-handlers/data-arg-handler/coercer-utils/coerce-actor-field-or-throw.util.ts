import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';

import { coerceRatingAndSelectFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-rating-and-select-field-or-throw.util';
import { coerceRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-raw-json-field-or-throw.util';
import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';

export const coerceActorFieldOrThrow = (
  value: unknown,
  fieldName?: string,
  isNullEquivalenceEnabled: boolean = false,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw Error;

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);

    for (const subField of subfields) {
      switch (subField) {
        case 'source':
          coerceRatingAndSelectFieldOrThrow(
            parsedValue[subField],
            Object.keys(FieldActorSource),
            `${fieldName}.${subField}`,
            isNullEquivalenceEnabled,
          );
          break;
        case 'context':
          coerceRawJsonFieldOrThrow(
            parsedValue[subField],
            `${fieldName}.${subField}`,
          );
          break;
        default:
          throw new CommonDataCoercerException(
            `Invalid subfield ${subField}`,
            CommonDataCoercerExceptionCode.INVALID_ACTOR,
          );
      }
    }

    return value;
  } catch (error) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for actor field "${fieldName}" - ${error.message}`,
      CommonDataCoercerExceptionCode.INVALID_ACTOR,
    );
  }
};
