/* @license Enterprise */

import type Stripe from 'stripe';

const buildItemSignature = (
  phase: Stripe.SubscriptionScheduleUpdateParams.Phase,
): string =>
  JSON.stringify(
    (phase.items ?? [])
      .map(({ price, quantity }): [string, number | undefined] => [
        price ?? '',
        quantity,
      ])
      .sort(([priceA], [priceB]) => priceA.localeCompare(priceB)),
  );

export const isSamePhaseSignature = (
  a: Stripe.SubscriptionScheduleUpdateParams.Phase,
  b: Stripe.SubscriptionScheduleUpdateParams.Phase,
): boolean => buildItemSignature(a) === buildItemSignature(b);
