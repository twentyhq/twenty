/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

const BILLING_REFUSAL_EXCEPTION_CODES = [
  BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
];

const USAGE_LIMIT_REFUSAL_EXCEPTION_CODES = [
  UsageLimitExceptionCode.QUOTA_EXHAUSTED,
  UsageLimitExceptionCode.STOCK_EXHAUSTED,
];

export const isUsageRefusedError = (
  error: unknown,
): error is BillingException | UsageLimitException =>
  (error instanceof BillingException &&
    BILLING_REFUSAL_EXCEPTION_CODES.includes(error.code)) ||
  (error instanceof UsageLimitException &&
    USAGE_LIMIT_REFUSAL_EXCEPTION_CODES.includes(error.code));
