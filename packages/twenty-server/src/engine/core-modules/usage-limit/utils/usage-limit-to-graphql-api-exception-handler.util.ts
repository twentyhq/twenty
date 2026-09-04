import { isDefined } from 'twenty-shared/utils';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { getUsageLimitErrorCode } from 'src/engine/core-modules/usage-limit/utils/get-usage-limit-error-code.util';

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
      exhaustedKind: exhaustedScope.exhaustedKind,
      limitValueType: exhaustedScope.limitValueType,
      limit: exhaustedScope.limitValue,
      remaining: exhaustedScope.remaining,
      periodCount: exhaustedScope.periodCount,
      periodUnit: exhaustedScope.periodUnit,
      retryAfterMs: exhaustedScope.retryAfterMs,
      scope: {
        spenderType: exhaustedScope.spenderType,
        spenderId: exhaustedScope.spenderId,
        operationType: exhaustedScope.operationType,
      },
    },
  );
};
