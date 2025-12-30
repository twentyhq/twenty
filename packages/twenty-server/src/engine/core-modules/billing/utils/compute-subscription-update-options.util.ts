import { assertUnreachable } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  SubscriptionUpdateType,
  type SubscriptionUpdate,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';

export const computeSubscriptionUpdateOptions = (
  subscriptionUpdate: SubscriptionUpdate,
): {
  proration: Stripe.SubscriptionUpdateParams.ProrationBehavior;
  metadata?: Record<string, string>;
  anchor?: Stripe.SubscriptionUpdateParams.BillingCycleAnchor;
} => {
  switch (subscriptionUpdate.type) {
    case SubscriptionUpdateType.PLAN:
      return {
        proration: 'create_prorations',
        metadata: {
          plan: subscriptionUpdate.newPlan,
        },
      };
    case SubscriptionUpdateType.METERED_PRICE:
      return {
        proration: 'create_prorations',
      };

    case SubscriptionUpdateType.INTERVAL:
      return {
        proration: 'create_prorations',
        anchor: 'now',
      };
    case SubscriptionUpdateType.SEATS:
      return {
        proration: 'create_prorations',
      };
    default:
      return assertUnreachable(
        subscriptionUpdate,
        'Should never occur, add validator for new subscription update type',
      );
  }
};
