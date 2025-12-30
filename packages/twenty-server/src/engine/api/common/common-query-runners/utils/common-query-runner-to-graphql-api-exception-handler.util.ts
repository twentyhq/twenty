import { assertUnreachable } from 'twenty-shared/utils';

import {
  type CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import {
  AuthenticationError,
  InternalServerError,
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
    case CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA:
    case CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT:
    case CommonQueryRunnerExceptionCode.INVALID_CURSOR:
    case CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
    case CommonQueryRunnerExceptionCode.BAD_REQUEST:
    case CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY:
    case CommonQueryRunnerExceptionCode.MISSING_TIMEZONE_FOR_DATE_GROUP_BY:
      throw new UserInputError(error);
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new AuthenticationError(error);
    case CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD:
    case CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      throw new InternalServerError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
