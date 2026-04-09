import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

export const validateSingleKeyForGroupByOrThrow = ({
  groupByKeys,
  errorMessage,
}: {
  groupByKeys: string[];
  errorMessage: string;
}): void => {
  if (groupByKeys.length > 1) {
    throw new GraphqlQueryRunnerException(
      errorMessage,
      GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }
};
