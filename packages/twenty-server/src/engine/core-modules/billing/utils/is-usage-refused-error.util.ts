/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

const REFUSED_BILLING_EXCEPTION_CODES = [
  BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
  BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
];

const REFUSED_USAGE_LIMIT_EXCEPTION_CODES = [
  UsageLimitExceptionCode.QUOTA_EXHAUSTED,
  UsageLimitExceptionCode.STOCK_EXHAUSTED,
];

export const isUsageRefusedError = (
  error: unknown,
): error is BillingException | UsageLimitException =>
  (error instanceof BillingException &&
    REFUSED_BILLING_EXCEPTION_CODES.includes(error.code)) ||
  (error instanceof UsageLimitException &&
    REFUSED_USAGE_LIMIT_EXCEPTION_CODES.includes(error.code));
