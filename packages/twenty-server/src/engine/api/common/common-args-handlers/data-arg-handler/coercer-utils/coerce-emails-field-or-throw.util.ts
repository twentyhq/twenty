import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export const coerceEmailsFieldOrThrow = (
  value: unknown,
  fieldName?: string,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw Error;

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);
    const emailsSubfields = compositeTypeDefinitions
      .get(FieldMetadataType.EMAILS)
      ?.properties.filter(
        (prop) => prop.hidden !== true && prop.hidden !== 'input',
      )
      .map((prop) => prop.name);

    if (!subfields.every((subfield) => emailsSubfields?.includes(subfield)))
      throw Error;

    return transformEmailsValue(value);
  } catch (error) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for emails field "${fieldName}" - ${error.message}`,
      CommonDataCoercerExceptionCode.INVALID_EMAILS,
    );
  }
};
