import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { type FieldMetadataSettingsMapping } from 'twenty-shared/types';
import { FieldMetadataType } from 'twenty-shared/types';

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
    typeof value === 'string' &&
    settings?.validationPattern
  ) {
    const regex = new RegExp(settings.validationPattern);

    if (!regex.test(value)) {
      const errorMessage =
        settings.validationErrorMessage ??
        `Value does not match required pattern`;

      throw new CommonQueryRunnerException(
        `Field "${fieldName}" value does not match pattern ${settings.validationPattern}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        { userFriendlyMessage: msg`${errorMessage}` },
      );
    }
  }

  return value;
};
