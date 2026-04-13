/* @license Enterprise */

// Poll every 2 minutes.
// hasReachedCurrentPeriodCap is reset to false at the start of each billing
// period by BillingWebhookInvoiceService (on subscription_cycle invoice),
// on trial end (BillingSubscriptionService), and on plan changes
// (BillingSubscriptionUpdateService). This cron flips it true/false based
// on live ClickHouse usage within the current period.
export const enforceUsageCapCronPattern = '*/2 * * * *';
