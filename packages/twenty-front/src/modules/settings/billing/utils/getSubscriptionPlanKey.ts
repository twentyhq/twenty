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

// Not subscription.metadata.plan: scheduled plan switches never update it.
export const getSubscriptionPlanKey = (
  billingSubscription: SubscriptionWithPlan | null | undefined,
): BillingPlanKey | undefined =>
  findBaseProductSubscriptionItem(billingSubscription?.billingSubscriptionItems)
    ?.billingProduct.metadata.planKey;
