import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { validateEmailValueOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-email-value-or-throw.util';
import { validateAdditionalEmailArrayOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-additional-email-array-or-throw.util';

export const validateEmailsFieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  primaryEmail?: string | null;
  additionalEmails?: string[] | null;
} | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'primaryEmail':
          validateEmailValueOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'additionalEmails':
        validateAdditionalEmailArrayOrThrow(
          subFieldValue,
          `${fieldName}.${subField}`,
        );
        break;
      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for emails field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for emails.` },
        );
    }
  }

  return value as {
    primaryEmail?: string | null;
    additionalEmails?: string[] | null;
  };
};
