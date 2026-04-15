/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';

export const getBillingExceptionStatusCode = (
  exception: BillingException,
): 400 | 402 | 404 | 500 => {
  switch (exception.code) {
    case BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND:
    case BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND:
    case BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND:
    case BillingExceptionCode.BILLING_PLAN_NOT_FOUND:
    case BillingExceptionCode.BILLING_METER_NOT_FOUND:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND:
      return 404;
    case BillingExceptionCode.BILLING_METER_EVENT_FAILED:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE:
    case BillingExceptionCode.BILLING_MISSING_REQUEST_BODY:
      return 400;
    case BillingExceptionCode.BILLING_CREDITS_EXHAUSTED:
      return 402;
    case BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND:
    case BillingExceptionCode.BILLING_PRICE_NOT_FOUND:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND:
    case BillingExceptionCode.BILLING_UNHANDLED_ERROR:
    case BillingExceptionCode.BILLING_STRIPE_ERROR:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_INVALID:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_INVALID:
    case BillingExceptionCode.BILLING_PRICE_INVALID_TIERS:
    case BillingExceptionCode.BILLING_PRICE_INVALID:
    case BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND:
    case BillingExceptionCode.BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND:
      return 500;
    default: {
      return assertUnreachable(exception.code);
    }
  }
};
