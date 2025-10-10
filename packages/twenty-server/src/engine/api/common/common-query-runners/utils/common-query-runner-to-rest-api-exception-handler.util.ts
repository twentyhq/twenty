import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  CommonQueryRunnerExceptionCode,
  type CommonQueryRunnerException,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const commonQueryRunnerToRestApiExceptionHandler = (
  error: CommonQueryRunnerException,
): never => {
  switch (error.code) {
    case CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
      throw new BadRequestException(error.message);
    case CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundException('Record not found');
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new UnauthorizedException(error.message);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
