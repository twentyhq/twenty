import {
  type BillingPlanKey,
  type BillingProductKey,
} from '~/generated-metadata/graphql';

import { findBaseProductSubscriptionItem } from '@/settings/billing/utils/findBaseProductSubscriptionItem';

type SubscriptionWithPlan = {
  billingSubscriptionItems?:
    | {
        billingProduct: {
          metadata: { productKey: BillingProductKey; planKey: BillingPlanKey };
        };
      }[]
    | null;
};

// The product the subscription sits on, not subscription.metadata.plan: that
// copy is written at checkout and by immediate plan switches, and is never
// updated when a scheduled switch takes effect.
export const getSubscriptionPlanKey = (
  billingSubscription: SubscriptionWithPlan | null | undefined,
): BillingPlanKey | undefined =>
  findBaseProductSubscriptionItem(billingSubscription?.billingSubscriptionItems)
    ?.billingProduct.metadata.planKey;
