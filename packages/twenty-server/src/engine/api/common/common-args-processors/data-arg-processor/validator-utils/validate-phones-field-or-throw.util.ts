import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type PhonesFieldGraphQLInput } from 'src/engine/core-modules/record-transformer/utils/transform-phones-value.util';

export const validatePhonesFieldOrThrow = (
  value: unknown,
  fieldName: string,
): PhonesFieldGraphQLInput => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'primaryPhoneNumber':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'primaryPhoneCountryCode':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'primaryPhoneCallingCode':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'additionalPhones':
        validateRawJsonFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;

      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for phones field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for phones.` },
        );
    }
  }

  return value as PhonesFieldGraphQLInput;
};
