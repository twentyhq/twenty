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
    case CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER:
    case CommonQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT:
    case CommonQueryRunnerExceptionCode.INVALID_CURSOR:
    case CommonQueryRunnerExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
    case CommonQueryRunnerExceptionCode.BAD_REQUEST:
    case CommonQueryRunnerExceptionCode.TOO_COMPLEX_QUERY:
    case CommonQueryRunnerExceptionCode.MISSING_TIMEZONE_FOR_DATE_GROUP_BY:
    case CommonQueryRunnerExceptionCode.INVALID_TIMEZONE:
    case CommonQueryRunnerExceptionCode.FIELD_NOT_FOUND:
    case CommonQueryRunnerExceptionCode.INVALID_DIRECTION:
    case CommonQueryRunnerExceptionCode.MAX_DEPTH_REACHED:
      throw new UserInputError(error);
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new AuthenticationError(error);
    case CommonQueryRunnerExceptionCode.MISSING_FLAT_INDEX_MAPS:
    case CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD:
    case CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
    case CommonQueryRunnerExceptionCode.INVALID_POST_HOOK_PAYLOAD:
    case CommonQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND:
    case CommonQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND:
      throw new InternalServerError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
