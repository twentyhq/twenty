import { inspect } from 'util';

import { isNull, isObject } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  CommonDataCoercerException,
  CommonDataCoercerExceptionCode,
} from 'src/engine/api/common/common-args-handlers/data-arg-handler/errors/common-data-coercer.exception';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export const coerceRichTextV2FieldOrThrow = async (
  value: unknown,
  fieldName?: string,
) => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw new Error();

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);
    const richTextV2Subfields = compositeTypeDefinitions
      .get(FieldMetadataType.RICH_TEXT_V2)
      ?.properties.filter(
        (prop) => prop.hidden !== true && prop.hidden !== 'input',
      )
      .map((prop) => prop.name);

    if (!subfields.every((subfield) => richTextV2Subfields?.includes(subfield)))
      throw Error;

    return await transformRichTextV2Value(value);
  } catch (error) {
    throw new CommonDataCoercerException(
      `Invalid value ${inspect(value)} for rich text v2 field "${fieldName}" - ${error.message}`,
      CommonDataCoercerExceptionCode.INVALID_RICH_TEXT_V2,
    );
  }
};
