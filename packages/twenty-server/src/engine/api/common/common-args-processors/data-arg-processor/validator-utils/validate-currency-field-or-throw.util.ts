import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';

import { validateNumericFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-numeric-field-or-throw.util';
import { validateRawJsonFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-raw-json-field-or-throw.util';
import { validateTextFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-text-field-or-throw.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateCurrencyFieldOrThrow = (
  value: unknown,
  fieldName: string,
): {
  amountMicros?: number | string | null;
  currencyCode?: string | null;
} | null => {
  const preValidatedValue = validateRawJsonFieldOrThrow(value, fieldName);

  if (isNull(preValidatedValue)) return null;

  for (const [subField, subFieldValue] of Object.entries(preValidatedValue)) {
    switch (subField) {
      case 'amountMicros':
        validateNumericFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;
      case 'currencyCode':
        validateTextFieldOrThrow(subFieldValue, `${fieldName}.${subField}`);
        break;

      default:
        throw new CommonQueryRunnerException(
          `Invalid subfield ${subField} for currency field "${fieldName}"`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          { userFriendlyMessage: msg`Invalid value for currency.` },
        );
    }
  }

  return value as {
    amountMicros?: number | string | null;
    currencyCode?: string | null;
  };
};
