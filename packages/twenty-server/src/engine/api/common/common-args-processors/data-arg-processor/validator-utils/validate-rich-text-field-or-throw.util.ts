import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull, isObject, isString } from '@sniptt/guards';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const RICH_TEXT_SUBFIELDS = ['blocknote', 'markdown'];

export const validateRichTextFieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  blocknote: string | null | undefined;
  markdown: string | null | undefined;
} | null => {
  if (isNull(value)) return null;

  try {
    if (!isObject(value)) throw new Error('Should be an object');

    if (Object.keys(value).length === 0) return null;

    const subfields = Object.keys(value);

    if (!subfields.every((subfield) => RICH_TEXT_SUBFIELDS.includes(subfield)))
      throw new Error(
        `Should have only ${RICH_TEXT_SUBFIELDS.join(', ')} subfields`,
      );

    const { blocknote, markdown } = value as Record<string, unknown>;

    if (blocknote !== null && blocknote !== undefined && !isString(blocknote)) {
      throw new Error('blocknote must be a string');
    }

    if (markdown !== null && markdown !== undefined && !isString(markdown)) {
      throw new Error('markdown must be a string');
    }

    if (isNonEmptyString(blocknote)) {
      let parsed: unknown;

      try {
        parsed = JSON.parse(blocknote);
      } catch {
        throw new Error('blocknote must contain valid JSON');
      }

      if (!Array.isArray(parsed)) {
        throw new Error('blocknote must be a JSON array of blocks');
      }
    }

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
