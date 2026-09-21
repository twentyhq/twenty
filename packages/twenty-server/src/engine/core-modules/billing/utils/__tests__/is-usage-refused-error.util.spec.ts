import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

describe('isUsageRefusedError', () => {
  it('recognises an exhausted credit allowance', () => {
    expect(
      isUsageRefusedError(
        new BillingException(
          'Credits exhausted',
          BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
        ),
      ),
    ).toBe(true);
  });

  it('recognises an exhausted quota', () => {
    expect(
      isUsageRefusedError(
        new UsageLimitException(
          'Usage limit reached for workspace',
          UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        ),
      ),
    ).toBe(true);
  });

  it('recognises an inactive subscription', () => {
    expect(
      isUsageRefusedError(
        new BillingException(
          'Workspace has no active subscription',
          BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
        ),
      ),
    ).toBe(true);
  });

  it('recognises an exhausted stock', () => {
    expect(
      isUsageRefusedError(
        new UsageLimitException(
          'This workspace has reached its storage limit',
          UsageLimitExceptionCode.STOCK_EXHAUSTED,
        ),
      ),
    ).toBe(true);
  });

  it('leaves a rate limit to the caller, because waiting does help there', () => {
    expect(
      isUsageRefusedError(
        new UsageLimitException(
          'Rate limited',
          UsageLimitExceptionCode.RATE_LIMITED,
        ),
      ),
    ).toBe(false);
  });

  it('ignores an unrelated failure', () => {
    expect(isUsageRefusedError(new Error('socket closed'))).toBe(false);
  });
});
