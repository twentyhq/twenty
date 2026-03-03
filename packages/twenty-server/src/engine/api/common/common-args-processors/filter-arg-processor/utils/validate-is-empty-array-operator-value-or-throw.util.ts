import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateIsEmptyArrayOperatorValueOrThrow = (
  value: unknown,
  fieldName: string,
): void => {
  if (typeof value !== 'boolean') {
    throw new CommonQueryRunnerException(
      `Filter operator "isEmptyArray" requires a boolean value for field ${fieldName}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "isEmptyArray" operator requires a boolean`,
      },
    );
  }
};
