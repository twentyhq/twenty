import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateIsOperatorFilterValueOrThrow = (value: unknown): void => {
  if (value !== 'NULL' && value !== 'NOT_NULL') {
    throw new CommonQueryRunnerException(
      `Invalid filter value for "is" operator. Expected "NULL" or "NOT_NULL"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      { userFriendlyMessage: msg`Invalid value for "is" operator` },
    );
  }
};
