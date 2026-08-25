import { isDefined } from 'twenty-shared/utils';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { getUsageLimitErrorCode } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-error-code.util';

// The GraphQL transport answers 200 and reports the denial in the extensions:
// direct execution builds its own response, so an http status carried here
// would only apply on the yoga-executed path. REST is the one that answers 429.
export const usageLimitToGraphqlApiExceptionHandler = (
  error: UsageLimitException,
): never => {
  const { exhaustedScope } = error;

  const commonExtensions = {
    subCode: error.code,
    userFriendlyMessage: error.userFriendlyMessage,
  };

  if (!isDefined(exhaustedScope)) {
    throw new BaseGraphQLError(
      error.message,
      getUsageLimitErrorCode(error.code),
      commonExtensions,
    );
  }

  throw new BaseGraphQLError(
    error.message,
    getUsageLimitErrorCode(error.code),
    {
      ...commonExtensions,
      limitKind: exhaustedScope.limitKind,
      limit: exhaustedScope.limitValue,
      remaining: exhaustedScope.remaining,
      windowSeconds: exhaustedScope.windowSeconds,
      retryAfterMs: exhaustedScope.retryAfterMs,
      scope: {
        spenderType: exhaustedScope.spenderType,
        spenderId: exhaustedScope.spenderId,
      },
    },
  );
};
