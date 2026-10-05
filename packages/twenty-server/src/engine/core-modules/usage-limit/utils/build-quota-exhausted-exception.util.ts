import { msg } from '@lingui/core/macro';

import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export const buildQuotaExhaustedException = (
  exhaustedScope: ExhaustedScope,
): UsageLimitException => {
  if (exhaustedScope.exhaustedKind === 'allowance') {
    return new UsageLimitException(
      'Credit allowance exhausted for this billing period',
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      {
        userFriendlyMessage: msg`Credit allowance exhausted for this billing period.`,
        exhaustedScope,
      },
    );
  }

  return new UsageLimitException(
    `Usage limit reached for ${exhaustedScope.spenderType}`,
    UsageLimitExceptionCode.QUOTA_EXHAUSTED,
    { exhaustedScope },
  );
};
