import { GraphQLError } from 'graphql';

import { isDefined } from 'twenty-shared/utils';

import {
  type UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

export const usageLimitToGraphqlApiExceptionHandler = (
  error: UsageLimitException,
): never => {
  const { exhaustedScope } = error;

  throw new GraphQLError(error.message, {
    extensions: {
      code:
        error.code === UsageLimitExceptionCode.QUOTA_EXHAUSTED
          ? 'QUOTA_EXHAUSTED'
          : 'RATE_LIMITED',
      ...(isDefined(exhaustedScope)
        ? {
            limitKind: exhaustedScope.limitKind,
            limit: exhaustedScope.limitValue,
            remaining: exhaustedScope.remaining,
            windowSeconds: exhaustedScope.windowSeconds,
            retryAfterMs: exhaustedScope.retryAfterMs,
            scope: {
              spenderType: exhaustedScope.spenderType,
              spenderId: exhaustedScope.spenderId,
            },
          }
        : {}),
    },
  });
};
