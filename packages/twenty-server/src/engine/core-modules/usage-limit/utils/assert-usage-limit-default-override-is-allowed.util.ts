import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';

export const assertUsageLimitDefaultOverrideIsAllowed = ({
  scope,
  isOperator,
}: {
  scope: UsageLimitScope;
  isOperator: boolean;
}): void => {
  if (isOperator) {
    return;
  }

  if (!isNonEmptyArray(findSuppressedUsageLimitDefaults(scope))) {
    return;
  }

  throw new UsageLimitException(
    `The ${scope.resourceType} ${scope.limitKind} default is set for this instance and only an operator can replace it`,
    UsageLimitExceptionCode.LIMIT_INVALID,
  );
};
