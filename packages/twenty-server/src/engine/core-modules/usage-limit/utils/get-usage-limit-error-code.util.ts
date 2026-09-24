import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

export const getUsageLimitErrorCode = (
  code: UsageLimitExceptionCode,
): ErrorCode => {
  if (
    code === UsageLimitExceptionCode.QUOTA_EXHAUSTED ||
    code === UsageLimitExceptionCode.STOCK_EXHAUSTED
  ) {
    return ErrorCode.QUOTA_EXHAUSTED;
  }

  if (code === UsageLimitExceptionCode.LIMIT_FORBIDDEN) {
    return ErrorCode.FORBIDDEN;
  }

  return ErrorCode.RATE_LIMITED;
};
