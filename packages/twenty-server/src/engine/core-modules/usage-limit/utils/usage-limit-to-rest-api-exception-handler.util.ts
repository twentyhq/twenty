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

export const buildUsageLimitHttpException = (
  error: UsageLimitException,
): HttpException => {
  const { exhaustedScope } = error;

  const isQuotaExhausted =
    error.code === UsageLimitExceptionCode.QUOTA_EXHAUSTED;

  const statusCode = isQuotaExhausted
    ? HttpStatus.PAYMENT_REQUIRED
    : HttpStatus.TOO_MANY_REQUESTS;

  if (!isDefined(exhaustedScope)) {
    return new HttpException(error.message, statusCode);
  }

  const retryAfterSeconds = getRetryAfterSeconds(exhaustedScope.retryAfterMs);

  return new UsageLimitHttpException(
    {
      statusCode,
      error: getUsageLimitErrorCode(error.code),
      messages: [error.message],
      limitKind: exhaustedScope.limitKind,
      scope: {
        spenderType: exhaustedScope.spenderType,
        spenderId: exhaustedScope.spenderId,
        operationType: exhaustedScope.operationType || null,
      },
      limit: exhaustedScope.limitValue,
      remaining: exhaustedScope.remaining,
      periodCount: exhaustedScope.periodCount,
      periodUnit: exhaustedScope.periodUnit,
      retryAfterSeconds,
    },
    isQuotaExhausted
      ? {}
      : buildRateLimitResponseHeaders({ exhaustedScope, retryAfterSeconds }),
  );
};

export const usageLimitToRestApiExceptionHandler = (
  error: UsageLimitException,
): never => {
  throw buildUsageLimitHttpException(error);
};
