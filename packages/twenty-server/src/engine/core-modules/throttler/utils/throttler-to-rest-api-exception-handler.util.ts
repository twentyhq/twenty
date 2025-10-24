import { BadRequestException } from '@nestjs/common';

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
      throw new BadRequestException(error.message);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
