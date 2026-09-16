/* @license Enterprise */

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { getBillingExceptionStatusCode } from 'src/engine/core-modules/billing/utils/get-billing-exception-status-code.util';

describe('getBillingExceptionStatusCode', () => {
  it('maps BILLING_PLAN_REQUIRED to 402', () => {
    const exception = new BillingException(
      'Workspace subscription plan is required',
      BillingExceptionCode.BILLING_PLAN_REQUIRED,
    );

    expect(getBillingExceptionStatusCode(exception)).toBe(402);
    expect(exception.statusCode).toBe(402);
  });

  it('maps BILLING_SUBSCRIPTION_INACTIVE to 402', () => {
    const exception = new BillingException(
      'Inactive subscription',
      BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
    );

    expect(getBillingExceptionStatusCode(exception)).toBe(402);
  });
});
