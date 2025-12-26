import {
  BadRequestException,
  InternalServerErrorException,
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
      throw new BadRequestException(error.message);
    case CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new NotFoundException('Record not found');
    case CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT:
      throw new UnauthorizedException(error.message);
    case CommonQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD:
    case CommonQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      throw new InternalServerErrorException(error.message);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
