import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';

import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

// Matches "url":"javascript:..." or "href":"javascript:..." in serialized JSON
const DANGEROUS_URL_IN_JSON_PATTERN =
  /"(?:url|href)"\s*:\s*"\\?\s*(?:javascript|vbscript)\s*:/i;

const hasDangerousUrl = (json: string): boolean => {
  return DANGEROUS_URL_IN_JSON_PATTERN.test(json);
};

const validateBlocknoteFieldOrThrow = (
  value: unknown,
  fieldName: string,
): string | null => {
  const textValue = validateTextFieldOrThrow(value, fieldName);

  if (!isNonEmptyString(textValue)) return textValue;

  let parsed: unknown;

  try {
    parsed = JSON.parse(textValue);
  } catch {
    throw new CommonQueryRunnerException(
      `Invalid blocknote value for field "${fieldName}" - must contain valid JSON`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for rich text.` },
    );
  }

  if (!Array.isArray(parsed)) {
    throw new CommonQueryRunnerException(
      `Invalid blocknote value for field "${fieldName}" - must be a JSON array of blocks`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value for rich text.` },
    );
  }

  if (hasDangerousUrl(textValue)) {
    throw new CommonQueryRunnerException(
      `Dangerous URL protocol in blocknote content for field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: msg`Content contains a URL with a dangerous protocol.`,
      },
    );
  }

  return textValue;
};

export const validateRichTextFieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  blocknote?: string | null;
  markdown?: string | null;
} | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'blocknote':
        validateBlocknoteFieldOrThrow(
          subFieldValue,
          `${fieldName}.${subField}`,
        );
        break;
      case 'markdown':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${inspect(subField)} for rich text field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for rich text.` },
        );
    }
  }

  return value as {
    blocknote?: string | null;
    markdown?: string | null;
  };
};
