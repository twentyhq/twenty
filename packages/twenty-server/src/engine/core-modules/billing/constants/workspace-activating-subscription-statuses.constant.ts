/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

// Subscription statuses under which a workspace can be (re)activated; notably
// excludes Incomplete, created by the payment-intent flow before any payment
export const WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] =
  [SubscriptionStatus.Active, SubscriptionStatus.Trialing];
