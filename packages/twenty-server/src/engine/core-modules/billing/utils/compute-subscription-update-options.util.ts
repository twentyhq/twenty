import { assertUnreachable } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import {
  SubscriptionUpdateType,
  type SubscriptionUpdate,
} from 'src/engine/core-modules/billing/types/billing-subscription-update.type';

export const computeSubscriptionUpdateOptions = (
  subscriptionUpdate: SubscriptionUpdate,
  context?: {
    isQuantityIncrease?: boolean;
    isTrialing?: boolean;
    isSendInvoice?: boolean;
  },
): {
  proration: Stripe.SubscriptionUpdateParams.ProrationBehavior;
  metadata?: Record<string, string>;
  anchor?: Stripe.SubscriptionUpdateParams.BillingCycleAnchor;
  paymentBehavior?: Stripe.SubscriptionUpdateParams.PaymentBehavior;
} => {
  switch (subscriptionUpdate.type) {
    case SubscriptionUpdateType.PLAN:
      return {
        proration: context?.isTrialing ? 'none' : 'always_invoice',
        metadata: {
          plan: subscriptionUpdate.newPlan,
        },
      };
    case SubscriptionUpdateType.RESOURCE_CREDIT_PRICE:
      return {
        proration: 'none',
      };
    case SubscriptionUpdateType.INTERVAL:
      return context?.isTrialing
        ? {
            proration: 'none',
          }
        : {
            proration: 'create_prorations',
            anchor: 'now',
          };
    case SubscriptionUpdateType.QUANTITIES:
    case SubscriptionUpdateType.APPLICATIONS: {
      const shouldInvoiceImmediately =
        context?.isQuantityIncrease && !context?.isSendInvoice;

      if (!shouldInvoiceImmediately) {
        return { proration: 'create_prorations' };
      }

      if (subscriptionUpdate.type === SubscriptionUpdateType.QUANTITIES) {
        return { proration: 'always_invoice' };
      }

      return {
        proration: 'always_invoice',
        paymentBehavior: 'error_if_incomplete',
      };
    }
    default:
      return assertUnreachable(
        subscriptionUpdate,
        'Should never occur, add validator for new subscription update type',
      );
  }
};
