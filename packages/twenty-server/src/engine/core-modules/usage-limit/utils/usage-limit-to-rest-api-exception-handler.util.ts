import { HttpException, HttpStatus } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { UsageLimitHttpException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit-http.exception';
import {
  type UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { buildRateLimitResponseHeaders } from 'src/engine/core-modules/usage-limit/utils/build-rate-limit-response-headers.util';
import { getRetryAfterSeconds } from 'src/engine/core-modules/usage-limit/utils/get-retry-after-seconds.util';
import { getUsageLimitErrorCode } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-error-code.util';

export const usageLimitToRestApiExceptionHandler = (
  error: UsageLimitException,
): never => {
  const { exhaustedScope } = error;

  const isQuotaExhausted =
    error.code === UsageLimitExceptionCode.QUOTA_EXHAUSTED;

  if (!isDefined(exhaustedScope)) {
    throw new HttpException(
      error.message,
      isQuotaExhausted
        ? HttpStatus.PAYMENT_REQUIRED
        : HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  // An exhausted quota is not a pacing problem: retrying sooner cannot help,
  // so no Retry-After and no rate-limit headers.
  if (exhaustedScope.limitKind === 'quota') {
    throw new UsageLimitHttpException(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: getUsageLimitErrorCode(error.code),
        messages: [error.message],
        limitKind: exhaustedScope.limitKind,
        scope: {
          spenderType: exhaustedScope.spenderType,
          spenderId: exhaustedScope.spenderId,
        },
        limit: exhaustedScope.limitValue,
        remaining: exhaustedScope.remaining,
        periodEnd: exhaustedScope.periodEnd?.toISOString(),
      },
      {},
    );
  }

  const retryAfterSeconds = getRetryAfterSeconds(exhaustedScope.retryAfterMs);

  throw new UsageLimitHttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: getUsageLimitErrorCode(error.code),
      messages: [error.message],
      limitKind: exhaustedScope.limitKind,
      scope: {
        spenderType: exhaustedScope.spenderType,
        spenderId: exhaustedScope.spenderId,
      },
      limit: exhaustedScope.limitValue,
      remaining: exhaustedScope.remaining,
      windowSeconds: exhaustedScope.windowSeconds,
      retryAfterSeconds,
    },
    buildRateLimitResponseHeaders({ exhaustedScope, retryAfterSeconds }),
  );
};
