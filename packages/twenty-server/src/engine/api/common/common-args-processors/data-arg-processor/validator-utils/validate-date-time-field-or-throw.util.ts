import { inspect } from 'util';

import { msg } from '@lingui/core/macro';
import { isDate, isNull, isString } from '@sniptt/guards';
import { isValid } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { parseToInstantOrThrow } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

const throwInvalidDateTimeFieldException = (
  value: unknown,
  fieldName: string,
): never => {
  const inspectedValue = inspect(value);

  throw new CommonQueryRunnerException(
    `Invalid value ${inspectedValue} for date-time field "${fieldName}". Expected format: 'YYYY-MM-DDTHH:mm:ssZ'`,
    CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
    {
      userFriendlyMessage: msg`Invalid value for date-time: "${inspectedValue}". Expected format: 'YYYY-MM-DDTHH:mm:ssZ'`,
    },
  );
};

export const validateDateTimeFieldOrThrow = (
  value: unknown,
  fieldName: string,
): unknown => {
  if (isNull(value)) return null;

  if (isDate(value) && isValid(value)) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime()).toString();
  }

  if (isString(value)) {
    try {
      return parseToInstantOrThrow(value).toString();
    } catch {
      throwInvalidDateTimeFieldException(value, fieldName);
    }
  }

  throwInvalidDateTimeFieldException(value, fieldName);
};
