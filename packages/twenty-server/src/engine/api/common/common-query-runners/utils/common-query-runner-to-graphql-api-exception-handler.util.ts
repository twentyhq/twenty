import { assertUnreachable } from 'twenty-shared/utils';

import {
  CommonQueryRunnerExceptionCode,
  type CommonQueryRunnerException,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  AuthenticationError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const commonQueryRunnerToGraphqlApiExceptionHandler = (
  error: CommonQueryRunnerException,
) => {
  switch (error.code) {
    case CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundError(error);
    case CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
      throw new UserInputError(error);
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new AuthenticationError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
