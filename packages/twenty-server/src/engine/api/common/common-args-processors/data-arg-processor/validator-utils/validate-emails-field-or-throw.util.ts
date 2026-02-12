import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateEmailsAdditionalEmailsSubfieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-emails-additional-emails-subfield-or-throw.util';
import { validateEmailsPrimaryEmailSubfieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-emails-primary-email-subfield-or-throw.util';
import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

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
        validateEmailsPrimaryEmailSubfieldOrThrow(
          subFieldValue,
          `${fieldName}.${subField}`,
        );
        break;
      case 'additionalEmails':
        validateEmailsAdditionalEmailsSubfieldOrThrow(
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
