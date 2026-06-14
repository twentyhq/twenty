import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString, isNull } from '@sniptt/guards';
import {
  type FieldMetadataSettingsMapping,
  type FieldMetadataType,
} from 'twenty-shared/types';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateTextFieldOrThrow = (
  value: unknown,
  fieldName: string,
  settings?: FieldMetadataSettingsMapping[FieldMetadataType.TEXT] | null,
): string | null => {
  if (typeof value !== 'string' && !isNull(value)) {
    const inspectedValue = inspect(value);

    throw new CommonQueryRunnerException(
      `Invalid string value ${inspectedValue} for text field "${fieldName}"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      { userFriendlyMessage: msg`Invalid value: "${inspectedValue}"` },
    );
  }

  if (
    typeof value !== 'string' ||
    value.trim() === '' ||
    !isNonEmptyString(settings?.validationPattern)
  ) {
    return value;
  }

  const doesValueMatchPattern = new RegExp(settings.validationPattern).test(
    value,
  );

  if (!doesValueMatchPattern) {
    const customErrorMessage = settings.validationErrorMessage;

    throw new CommonQueryRunnerException(
      `Field "${fieldName}" value does not match pattern ${settings.validationPattern}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
      {
        userFriendlyMessage: isNonEmptyString(customErrorMessage)
          ? msg`${customErrorMessage}`
          : msg`Value does not match the required format`,
      },
    );
  }

  return value;
};
