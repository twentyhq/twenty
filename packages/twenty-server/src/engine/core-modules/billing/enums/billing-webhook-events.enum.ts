/* @license Enterprise */

export enum BillingWebhookEvent {
  CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  CUSTOMER_CREATED = 'customer.created',
  SETUP_INTENT_SUCCEEDED = 'setup_intent.succeeded',
  CUSTOMER_ACTIVE_ENTITLEMENT_SUMMARY_UPDATED = 'entitlements.active_entitlement_summary.updated',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRICE_CREATED = 'price.created',
  PRICE_UPDATED = 'price.updated',
  ALERT_TRIGGERED = 'billing.alert.triggered',
  INVOICE_FINALIZED = 'invoice.finalized',
  SUBSCRIPTION_SCHEDULE_UPDATED = 'subscription_schedule.updated',
  CREDIT_GRANT_CREATED = 'billing.credit_grant.created',
  CREDIT_GRANT_UPDATED = 'billing.credit_grant.updated',
}
