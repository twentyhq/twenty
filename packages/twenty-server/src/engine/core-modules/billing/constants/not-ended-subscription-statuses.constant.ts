/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const NOT_ENDED_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.Active,
  SubscriptionStatus.Trialing,
  SubscriptionStatus.PastDue,
  SubscriptionStatus.Unpaid,
  SubscriptionStatus.Incomplete,
  SubscriptionStatus.Paused,
];
