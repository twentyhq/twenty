/* @license Enterprise */

import { type BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { type SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';

type ResourceCreditPriceForSubscription = {
  interval: SubscriptionInterval;
  billingProduct?: { metadata?: { planKey?: BillingPlanKey } | null } | null;
};

export const isResourceCreditPriceForSubscription = ({
  billingPrice,
  interval,
  planKey,
}: {
  billingPrice: ResourceCreditPriceForSubscription;
  interval: SubscriptionInterval;
  planKey: BillingPlanKey | undefined;
}): boolean =>
  billingPrice.interval === interval &&
  billingPrice.billingProduct?.metadata?.planKey === planKey;
