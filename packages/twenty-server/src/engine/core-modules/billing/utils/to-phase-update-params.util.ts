/* @license Enterprise */

import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { normalizePriceRef } from 'src/engine/core-modules/billing/utils/normalize-price-ref.utils';

const getStripeObjectId = (reference: string | { id: string }): string =>
  isString(reference) ? reference : reference.id;

const toPhaseDiscountParam = ({
  coupon,
  discount,
  promotion_code,
}: Stripe.SubscriptionSchedule.Phase.Discount): Stripe.SubscriptionScheduleUpdateParams.Phase.Discount => {
  if (isDefined(discount)) {
    return { discount: getStripeObjectId(discount) };
  }

  if (isDefined(promotion_code)) {
    return { promotion_code: getStripeObjectId(promotion_code) };
  }

  return isDefined(coupon) ? { coupon: getStripeObjectId(coupon) } : {};
};

export const toPhaseUpdateParams = (
  phase: Stripe.SubscriptionSchedule.Phase,
): Stripe.SubscriptionScheduleUpdateParams.Phase =>
  ({
    start_date: phase.start_date,
    end_date: phase.end_date ?? undefined,
    items: (phase.items || []).map((item) => ({
      price: normalizePriceRef(item.price) as string,
      quantity: item.quantity ?? undefined,
    })),
    ...(isDefined(phase.billing_thresholds)
      ? { billing_thresholds: phase.billing_thresholds }
      : {}),
    ...(isNonEmptyArray(phase.discounts)
      ? { discounts: phase.discounts.map(toPhaseDiscountParam) }
      : {}),
    proration_behavior: 'none',
  }) as Stripe.SubscriptionScheduleUpdateParams.Phase;
