/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const WORKSPACE_ACTIVATING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] =
  [SubscriptionStatus.Active, SubscriptionStatus.Trialing];
