/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import type Stripe from 'stripe';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { type SubscriptionStripePrices } from 'src/engine/core-modules/billing/types/subscription-stripe-prices.type';
import { buildPhaseUpdateParamsOrThrow } from 'src/engine/core-modules/billing/utils/build-phase-update-params-or-throw.util';

export const buildSchedulePhasesUpdate = ({
  currentPhase,
  nextPhase,
  productKeyByPriceId,
  toUpdateCurrentPrices,
  toUpdateNextPrices,
  subscriptionCurrentPeriodEnd,
}: {
  currentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  nextPhase: Stripe.SubscriptionScheduleUpdateParams.Phase | undefined;
  productKeyByPriceId: Map<string, BillingProductKey>;
  toUpdateCurrentPrices: SubscriptionStripePrices | undefined;
  toUpdateNextPrices: SubscriptionStripePrices;
  subscriptionCurrentPeriodEnd: number;
}): {
  toUpdateCurrentPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
  toUpdateNextPhase: Stripe.SubscriptionScheduleUpdateParams.Phase;
} => ({
  toUpdateCurrentPhase: isDefined(toUpdateCurrentPrices)
    ? buildPhaseUpdateParamsOrThrow({
        currentPhase,
        productKeyByPriceId,
        toUpdatePrices: toUpdateCurrentPrices,
        endDate: subscriptionCurrentPeriodEnd,
        startDate: currentPhase.start_date,
      })
    : { ...currentPhase, end_date: subscriptionCurrentPeriodEnd },
  toUpdateNextPhase: buildPhaseUpdateParamsOrThrow({
    currentPhase: nextPhase ?? currentPhase,
    productKeyByPriceId,
    toUpdatePrices: toUpdateNextPrices,
    startDate: subscriptionCurrentPeriodEnd,
    endDate: undefined,
  }),
});
