import { HttpException, HttpStatus } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UsageLimitHttpException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit-http.exception';
import {
  type UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

export const usageLimitToRestApiExceptionHandler = (
  error: UsageLimitException,
): never => {
  const { exhaustedScope } = error;

  if (!isDefined(exhaustedScope)) {
    throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(exhaustedScope.retryAfterMs / 1000),
  );

  throw new UsageLimitHttpException(
    {
      error:
        error.code === UsageLimitExceptionCode.QUOTA_EXHAUSTED
          ? 'QUOTA_EXHAUSTED'
          : 'RATE_LIMITED',
      limitKind: exhaustedScope.limitKind,
      message: error.message,
      scope: {
        spenderType: exhaustedScope.spenderType,
        spenderId: exhaustedScope.spenderId,
      },
      limit: exhaustedScope.limitValue,
      remaining: exhaustedScope.remaining,
      windowSeconds: exhaustedScope.windowSeconds,
      retryAfterSeconds,
    },
    {
      'Retry-After': String(retryAfterSeconds),
      'X-RateLimit-Limit': String(exhaustedScope.limitValue),
      'X-RateLimit-Remaining': String(exhaustedScope.remaining),
      'X-RateLimit-Reset': String(
        Math.ceil(Date.now() / 1000) + retryAfterSeconds,
      ),
    },
  );
};
