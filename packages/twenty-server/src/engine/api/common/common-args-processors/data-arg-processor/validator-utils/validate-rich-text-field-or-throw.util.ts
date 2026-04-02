import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const isUnsafeUrl = (url: string): boolean => {
  if (url.startsWith('/')) {
    return false;
  }

  try {
    const parsed = new URL(url);

    return !SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return true;
  }
};

const validateBlocknoteBlockUrlsOrThrow = (
  blocks: unknown[],
  fieldName: string,
): void => {
  for (const block of blocks) {
    if (typeof block !== 'object' || block === null) {
      continue;
    }

    const blockRecord = block as Record<string, unknown>;
    const props = blockRecord.props as Record<string, unknown> | undefined;

    if (isDefined(props?.url) && typeof props.url === 'string') {
      if (isUnsafeUrl(props.url)) {
        throw new CommonQueryRunnerException(
          `Unsafe URL protocol in block for field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`URL contains an unsafe protocol.` },
        );
      }
    }

    // Inline content can contain links with href
    if (Array.isArray(blockRecord.content)) {
      for (const inlineContent of blockRecord.content) {
        if (
          typeof inlineContent === 'object' &&
          isDefined(inlineContent) &&
          inlineContent.type === 'link' &&
          typeof inlineContent.href === 'string' &&
          isUnsafeUrl(inlineContent.href)
        ) {
          throw new CommonQueryRunnerException(
            `Unsafe URL protocol in inline link for field "${fieldName}"`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            { userFriendlyMessage: msg`Link contains an unsafe protocol.` },
          );
        }
      }
    }

    if (Array.isArray(blockRecord.children)) {
      validateBlocknoteBlockUrlsOrThrow(blockRecord.children, fieldName);
    }
  }
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

  validateBlocknoteBlockUrlsOrThrow(parsed, fieldName);

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
