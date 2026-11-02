/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { getStripeObjectId } from 'src/engine/core-modules/billing/utils/get-stripe-object-id.util';

export const toPhaseUpdateParams = (
  phase: Stripe.SubscriptionSchedule.Phase,
): Stripe.SubscriptionScheduleUpdateParams.Phase =>
  ({
    start_date: phase.start_date,
    end_date: phase.end_date ?? undefined,
    items: (phase.items || []).map((item) => ({
      price: getStripeObjectId(item.price) as string,
      quantity: item.quantity ?? undefined,
    })),
    ...(isDefined(phase.billing_thresholds)
      ? { billing_thresholds: phase.billing_thresholds }
      : {}),
    proration_behavior: 'none',
  }) as Stripe.SubscriptionScheduleUpdateParams.Phase;
