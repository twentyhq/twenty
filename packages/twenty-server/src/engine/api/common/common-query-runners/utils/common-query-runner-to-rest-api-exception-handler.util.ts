import { BadRequestException } from '@nestjs/common';

import {
  CommonQueryRunnerExceptionCode,
  type CommonQueryRunnerException,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

export const commonQueryRunnerToRestApiExceptionHandler = (
  error: CommonQueryRunnerException,
) => {
  switch (error.code) {
    case CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND:
      throw new BadRequestException('Record not found');
    default:
      throw error;
  }
};
