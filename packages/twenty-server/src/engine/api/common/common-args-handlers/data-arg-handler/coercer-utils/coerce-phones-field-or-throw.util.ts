import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import { transformPhonesValue } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export const coercePhonesFieldOrThrow = (
  value: unknown,
  fieldName?: string,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw Error;

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);
    const phonesSubfields = compositeTypeDefinitions
      .get(FieldMetadataType.PHONES)
      ?.properties.filter(
        (prop) => prop.hidden !== true && prop.hidden !== 'input',
      )
      .map((prop) => prop.name);

    if (!subfields.every((subfield) => phonesSubfields?.includes(subfield)))
      throw Error;

    return transformPhonesValue({
      input: value,
    });
  } catch (error) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for phones field "${fieldName}" - ${error.message}`,
      CommonDataCoercerExceptionCode.INVALID_PHONES,
    );
  }
};
