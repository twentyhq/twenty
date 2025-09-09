import { assertUnreachable } from 'twenty-shared/utils';

import {
  type GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const graphqlQueryRunnerExceptionHandler = (
  error: GraphqlQueryRunnerException,
) => {
  switch (error.code) {
    case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST:
    case GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST:
    case GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED:
    case GraphqlQueryRunnerExceptionCode.INVALID_CURSOR:
    case GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION:
    case GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR:
    case GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT:
    case GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
    case GraphqlQueryRunnerExceptionCode.NOT_IMPLEMENTED:
    case GraphqlQueryRunnerExceptionCode.UPSERT_MULTIPLE_MATCHING_RECORDS_CONFLICT:
    case GraphqlQueryRunnerExceptionCode.UPSERT_MAX_RECORDS_EXCEEDED:
      throw new UserInputError(error);
    case GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundError(error);
    case GraphqlQueryRunnerExceptionCode.RELATION_SETTINGS_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.RELATION_TARGET_OBJECT_METADATA_NOT_FOUND:
    case GraphqlQueryRunnerExceptionCode.INVALID_POST_HOOK_PAYLOAD:
    case GraphqlQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD:
      throw error;
    default: {
      return assertUnreachable(error.code);
    }
  }
};
