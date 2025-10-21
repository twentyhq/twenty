import { BadRequestException } from '@nestjs/common';

import { type QueryFailedError } from 'typeorm';

import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { commonQueryRunnerToRestApiExceptionHandler } from 'src/engine/api/common/common-query-runners/utils/common-query-runner-to-rest-api-exception-handler.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

interface QueryFailedErrorWithCode extends QueryFailedError {
  code: string;
}

export const workspaceQueryRunnerRestApiExceptionHandler = (
  error: QueryFailedErrorWithCode,
): never => {
  switch (true) {
    case error instanceof CommonQueryRunnerException:
      return commonQueryRunnerToRestApiExceptionHandler(error);
    case error instanceof RestInputRequestParserException:
      throw new BadRequestException(error.message);
    default:
      throw error;
  }
};
