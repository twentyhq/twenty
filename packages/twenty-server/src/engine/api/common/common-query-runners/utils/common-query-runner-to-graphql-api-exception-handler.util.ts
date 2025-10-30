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
    case CommonQueryRunnerExceptionCode.ARGS_CONFLICT:
    case CommonQueryRunnerExceptionCode.INVALID_ARGS_FIRST:
    case CommonQueryRunnerExceptionCode.INVALID_ARGS_LAST:
    case CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
    case CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT:
    case CommonQueryRunnerExceptionCode.INVALID_CURSOR:
    case CommonQueryRunnerExceptionCode.UPSERT_MAX_RECORDS_EXCEEDED:
      throw new UserInputError(error);
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new AuthenticationError(error);
    case CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD:
      throw error;
    default: {
      return assertUnreachable(error.code);
    }
  }
};
