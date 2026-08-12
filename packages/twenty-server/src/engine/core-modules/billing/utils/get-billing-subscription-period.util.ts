/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

export const getBillingSubscriptionPeriod = (
  subscription: BillingSubscriptionEntity,
): { periodStart: Date; periodEnd: Date } => {
  const { trialStart, trialEnd } = subscription;

  if (
    subscription.status === SubscriptionStatus.Trialing &&
    isDefined(trialStart) &&
    isDefined(trialEnd)
  ) {
    return { periodStart: trialStart, periodEnd: trialEnd };
  }

  return {
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
  };
};
