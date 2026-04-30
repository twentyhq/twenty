import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';

import { type FilterOperator } from 'src/engine/api/common/common-args-processors/filter-arg-processor/types/filter-operator.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const validateStringOperatorValueOrThrow = (
  value: unknown,
  operator: FilterOperator,
  fieldName: string,
): void => {
  if (!isString(value)) {
    throw new CommonQueryRunnerException(
      `Filter operator "${operator}" requires a string value for field "${fieldName}", got ${typeof value}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "${operator}" operator requires a String`,
      },
    );
  }
};
