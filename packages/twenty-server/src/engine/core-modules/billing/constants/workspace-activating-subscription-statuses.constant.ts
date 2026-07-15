/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

// Excludes Incomplete: the payment-intent flow creates the subscription before any payment
export const WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] =
  [SubscriptionStatus.Active, SubscriptionStatus.Trialing];
