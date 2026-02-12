import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull, isObject } from '@sniptt/guards';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateRichTextV2FieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  blocknote: string | null | undefined;
  markdown: string | null | undefined;
} | null => {
  if (isNull(value)) return null;

  try {
    const parsedValue = JSON.parse(JSON.stringify(value));

    if (!isObject(parsedValue)) throw new Error('Should be an object');

    if (Object.keys(parsedValue).length === 0) return null;

    const subfields = Object.keys(parsedValue);
    const richTextV2Subfields = compositeTypeDefinitions
      .get(FieldMetadataType.RICH_TEXT_V2)
      ?.properties.filter(
        (prop) => prop.hidden !== true && prop.hidden !== 'input',
      )
      .map((prop) => prop.name);

    if (!subfields.every((subfield) => richTextV2Subfields?.includes(subfield)))
      throw new Error(
        `Should have only ${richTextV2Subfields?.join(', ')} subfields`,
      );

    return value as {
      blocknote: string | null | undefined;
      markdown: string | null | undefined;
    };
  } catch (error) {
    throw new CommonQueryRunnerException(
      `Invalid rich text v2 value ${inspect(value)} for field "${fieldName}" - ${error.message}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for rich text.` },
    );
  }
};
