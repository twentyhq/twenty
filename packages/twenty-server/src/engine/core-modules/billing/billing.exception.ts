/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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
}

const billingExceptionUserFriendlyMessages: Record<
  BillingExceptionCode,
  MessageDescriptor
> = {
  [BillingExceptionCode.BILLING_CUSTOMER_NOT_FOUND]: msg`Billing customer not found.`,
  [BillingExceptionCode.BILLING_PLAN_NOT_FOUND]: msg`Billing plan not found.`,
  [BillingExceptionCode.BILLING_PRODUCT_NOT_FOUND]: msg`Billing product not found.`,
  [BillingExceptionCode.BILLING_PRICE_NOT_FOUND]: msg`Billing price not found.`,
  [BillingExceptionCode.BILLING_METER_NOT_FOUND]: msg`Billing meter not found.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND]: msg`Subscription not found.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND]: msg`Subscription item not found.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_INVALID]: msg`Invalid subscription.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_EVENT_WORKSPACE_NOT_FOUND]: msg`Workspace not found for subscription event.`,
  [BillingExceptionCode.BILLING_CUSTOMER_EVENT_WORKSPACE_NOT_FOUND]: msg`Workspace not found for customer event.`,
  [BillingExceptionCode.BILLING_ACTIVE_SUBSCRIPTION_NOT_FOUND]: msg`No active subscription found.`,
  [BillingExceptionCode.BILLING_METER_EVENT_FAILED]: msg`Failed to record billing event.`,
  [BillingExceptionCode.BILLING_MISSING_REQUEST_BODY]: msg`Missing request body.`,
  [BillingExceptionCode.BILLING_UNHANDLED_ERROR]: msg`An unexpected billing error occurred.`,
  [BillingExceptionCode.BILLING_STRIPE_ERROR]: msg`A payment processing error occurred.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_NOT_IN_TRIAL_PERIOD]: msg`Subscription is not in trial period.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_NOT_SWITCHABLE]: msg`Cannot switch subscription interval.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_INTERVAL_INVALID]: msg`Invalid subscription interval.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_PLAN_NOT_SWITCHABLE]: msg`Cannot switch subscription plan.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_INVALID]: msg`Invalid subscription item.`,
  [BillingExceptionCode.BILLING_PRICE_INVALID_TIERS]: msg`Invalid pricing tiers.`,
  [BillingExceptionCode.BILLING_PRICE_INVALID]: msg`Invalid price.`,
  [BillingExceptionCode.BILLING_SUBSCRIPTION_PHASE_NOT_FOUND]: msg`Subscription phase not found.`,
  [BillingExceptionCode.BILLING_TOO_MUCH_SUBSCRIPTIONS_FOUND]: msg`Multiple subscriptions found where one was expected.`,
};

export class BillingException extends CustomException<BillingExceptionCode> {
  constructor(
    message: string,
    code: BillingExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? billingExceptionUserFriendlyMessages[code],
    });
  }
}
