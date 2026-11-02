/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { buildPhaseUpdateParamsOrThrow } from 'src/engine/core-modules/billing/utils/build-phase-update-params-or-throw.util';

type SubscriptionDiscount = Pick<Stripe.Discount, 'id' | 'end'>;

// A phase listing a coupon redeems it again, so phases reuse the live discount, and only while it lasts
const withSubscriptionDiscounts = (
  phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
  subscriptionDiscounts: SubscriptionDiscount[],
): Stripe.SubscriptionScheduleUpdateParams.Phase =>
  isNonEmptyArray(subscriptionDiscounts)
    ? {
        ...phase,
        discounts: subscriptionDiscounts.map(({ id }) => ({ discount: id })),
      }
    : phase;

export const buildSchedulePhasesUpdate = ({
  currentPhase,
  nextPhase,
  productKeyByPriceId,
  toUpdateCurrentPrices,
  toUpdateNextPrices,
  subscriptionCurrentPeriodEnd,
  subscriptionDiscounts,
}: {
  currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  nextPhase: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
  productKeyByPriceId: Map<string, BillingProductKey>;
  toUpdateCurrentPrices: SubscriptionStripePrices | undefined;
  toUpdateNextPrices: SubscriptionStripePrices;
  subscriptionCurrentPeriodEnd: number;
  subscriptionDiscounts: SubscriptionDiscount[];
}): {
  toUpdateCurrentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  toUpdateNextPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
} => ({
  toUpdateCurrentPhase: withSubscriptionDiscounts(
    isDefined(toUpdateCurrentPrices)
      ? buildPhaseUpdateParamsOrThrow({
          currentPhase,
          productKeyByPriceId,
          toUpdatePrices: toUpdateCurrentPrices,
          endDate: subscriptionCurrentPeriodEnd,
          startDate: currentPhase.start_date,
        })
      : { ...currentPhase, end_date: subscriptionCurrentPeriodEnd },
    subscriptionDiscounts,
  ),
  toUpdateNextPhase: withSubscriptionDiscounts(
    buildPhaseUpdateParamsOrThrow({
      currentPhase: nextPhase ?? currentPhase,
      productKeyByPriceId,
      toUpdatePrices: toUpdateNextPrices,
      startDate: subscriptionCurrentPeriodEnd,
      endDate: undefined,
    }),
    subscriptionDiscounts.filter(
      ({ end }) => !isDefined(end) || end > subscriptionCurrentPeriodEnd,
    ),
  ),
});
