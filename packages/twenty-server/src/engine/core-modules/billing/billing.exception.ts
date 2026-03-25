/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum BillingExceptionCode {
  BILLING_CUSTOMER_NOT_FOUND = 'BILLING_CUSTOMER_NOT_FOUND',
  BILLING_PLAN_NOT_FOUND = 'BILLING_PLAN_NOT_FOUND',
  BILLING_PRODUCT_NOT_FOUND = 'BILLING_PRODUCT_NOT_FOUND',
  BILLING_PRICE_NOT_FOUND = 'BILLING_PRICE_NOT_FOUND',
  BILLING_METER_NOT_FOUND = 'BILLING_METER_NOT_FOUND',
  BILLING_SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
  BILLING_SUBSCRIPTION_ITEM_NOT_FOUND = 'BILLING_SUBSCRIPTION_ITEM_NOT_FOUND',
  BILLING_SUBSCRIPTION_INVALID = 'BILLING_SUBSCRIPTION_INVALID',
  BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND = 'BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND',
  BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND = 'BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND',
  BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND = 'BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND',
  BILLING_METER_EVENT_FAILED = 'BILLING_METER_EVENT_FAILED',
  BILLING_MISSING_REQUEST_BODY = 'BILLING_MISSING_REQUEST_BODY',
  BILLING_UNHANDLED_ERROR = 'BILLING_UNHANDLED_ERROR',
  BILLING_STRIPE_ERROR = 'BILLING_STRIPE_ERROR',
  BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD = 'BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD',
  BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE = 'BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE',
  BILLING_SUBSCRIPTION_INTERVAL_INVALID = 'BILLING_SUBSCRIPTION_INTERVAL_INVALID',
  BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE = 'BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE',
  BILLING_SUBSCRIPTION_ITEM_INVALID = 'BILLING_SUBSCRIPTION_ITEM_INVALID',
  BILLING_PRICE_INVALID_TIERS = 'BILLING_PRICE_INVALID_TIERS',
  BILLING_PRICE_INVALID = 'BILLING_PRICE_INVALID',
  BILLING_SUBSCRIPTION_PHASE_NOT_FOUND = 'BILLING_SUBSCRIPTION_PHASE_NOT_FOUND',
  BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND = 'BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND',
  BILLING_CREDITS_EXHAUSTED = 'BILLING_CREDITS_EXHAUSTED',
}

const getBillingExceptionUserFriendlyMessage = (code: BillingExceptionCode) => {
  switch (code) {
    case BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND:
      return msg`Billing customer not found.`;
    case BillingExceptionCode.BILLING_PLAN_NOT_FOUND:
      return msg`Billing plan not found.`;
    case BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND:
      return msg`Billing product not found.`;
    case BillingExceptionCode.BILLING_PRICE_NOT_FOUND:
      return msg`Billing price not found.`;
    case BillingExceptionCode.BILLING_METER_NOT_FOUND:
      return msg`Billing meter not found.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND:
      return msg`Subscription not found.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND:
      return msg`Subscription item not found.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID:
      return msg`Invalid subscription.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND:
      return msg`Workspace not found for subscription event.`;
    case BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND:
      return msg`Workspace not found for customer event.`;
    case BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND:
      return msg`No active subscription found.`;
    case BillingExceptionCode.BILLING_METER_EVENT_FAILED:
      return msg`Failed to record billing event.`;
    case BillingExceptionCode.BILLING_MISSING_REQUEST_BODY:
      return msg`Missing request body.`;
    case BillingExceptionCode.BILLING_UNHANDLED_ERROR:
      return msg`An unexpected billing error occurred.`;
    case BillingExceptionCode.BILLING_STRIPE_ERROR:
      return msg`A payment processing error occurred.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD:
      return msg`Subscription is not in trial period.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE:
      return msg`Cannot switch subscription interval.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_INVALID:
      return msg`Invalid subscription interval.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE:
      return msg`Cannot switch subscription plan.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_INVALID:
      return msg`Invalid subscription item.`;
    case BillingExceptionCode.BILLING_PRICE_INVALID_TIERS:
      return msg`Invalid pricing tiers.`;
    case BillingExceptionCode.BILLING_PRICE_INVALID:
      return msg`Invalid price.`;
    case BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND:
      return msg`Subscription phase not found.`;
    case BillingExceptionCode.BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND:
      return msg`Multiple subscriptions found where one was expected.`;
    case BillingExceptionCode.BILLING_CREDITS_EXHAUSTED:
      return msg`You have exhausted your credits. Please upgrade your plan to continue.`;
    default:
      assertUnreachable(code);
  }
};

export class BillingException extends CustomException<BillingExceptionCode> {
  constructor(
    message: string,
    code: BillingExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getBillingExceptionUserFriendlyMessage(code),
    });
  }
}
