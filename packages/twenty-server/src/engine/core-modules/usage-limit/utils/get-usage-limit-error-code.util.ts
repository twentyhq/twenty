import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

export const getUsageLimitErrorCode = (
  code: UsageLimitExceptionCode,
): ErrorCode =>
  code === UsageLimitExceptionCode.QUOTA_EXHAUSTED
    ? ErrorCode.QUOTA_EXHAUSTED
    : ErrorCode.RATE_LIMITED;
