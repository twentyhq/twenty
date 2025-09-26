import {
  CommonQueryRunnerExceptionCode,
  type CommonQueryRunnerException,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const commonQueryRunnerToGraphqlApiExceptionHandler = (
  error: CommonQueryRunnerException,
) => {
  switch (error.code) {
    case CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundError(error);
    default:
      throw error;
  }
};
