import { HttpException, HttpStatus } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  type ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';

export const throttlerToRestApiExceptionHandler = (
  error: ThrottlerException,
): never => {
  switch (error.code) {
    case ThrottlerExceptionCode.LIMIT_REACHED:
      throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
