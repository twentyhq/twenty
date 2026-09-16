/* @license Enterprise */

import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

/**
 * Subscription statuses that satisfy PLAN_REQUIRED API enforcement.
 * Incomplete / incomplete_expired / paused / canceled do NOT — Incomplete is
 * created by createSubscriptionPaymentIntent before card success.
 */
export const PLAN_REQUIRED_SATISFYING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] =
  [
    SubscriptionStatus.Active,
    SubscriptionStatus.Trialing,
    SubscriptionStatus.PastDue,
    SubscriptionStatus.Unpaid,
  ];
