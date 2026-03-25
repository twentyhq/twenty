import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateFullNameFieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  firstName?: string | null;
  lastName?: string | null;
} | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'firstName':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'lastName':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for full name field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for full name.` },
        );
    }
  }

  return value as {
    firstName?: string | null;
    lastName?: string | null;
  };
};
