/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildSchedulePhasesUpdate } from 'src/engine/core-modules/billing/utils/build-schedule-phases-update.util';

const BASE_PRICE_ID = 'price_base_month';
const CREDIT_PRICE_ID = 'price_credit_month';
const PENDING_ONLY_PRICE_ID = 'price_pending_only_month';

const PERIOD_END = 1_800_000_000;

const productKeyByPriceId = new Map([
  [BASE_PRICE_ID, BillingProductKey.BASE_PRODUCT],
  [CREDIT_PRICE_ID, BillingProductKey.RESOURCE_CREDIT],
]);

const toUpdateNextPrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credit_year',
};

const buildPhase = (
  items: Array<{ price: string; quantity?: number }>,
  startDate: number,
): Stripe.SubscriptionScheduleUpdateParams.Phase => ({
  start_date: startDate,
  proration_behavior: 'none',
  items,
});

const currentPhase = buildPhase(
  [
    { price: BASE_PRICE_ID, quantity: 3 },
    { price: CREDIT_PRICE_ID, quantity: 1 },
  ],
  1_700_000_000,
);

describe('buildSchedulePhasesUpdate', () => {
  it('keeps an item the pending phase holds and the current phase does not', () => {
    const nextPhase = buildPhase(
      [
        { price: BASE_PRICE_ID, quantity: 3 },
        { price: CREDIT_PRICE_ID, quantity: 1 },
        { price: PENDING_ONLY_PRICE_ID, quantity: 2 },
      ],
      PERIOD_END,
    );

    const { toUpdateNextPhase } = buildSchedulePhasesUpdate({
      currentPhase,
      nextPhase,
      productKeyByPriceId,
      toUpdateCurrentPrices: undefined,
      toUpdateNextPrices,
      subscriptionCurrentPeriodEnd: PERIOD_END,
    });

    expect(toUpdateNextPhase.items).toEqual([
      { price: 'price_base_year', quantity: 7 },
      { price: 'price_credit_year', quantity: 1 },
      { price: PENDING_ONLY_PRICE_ID, quantity: 2 },
    ]);
  });

  it('drops an item the current phase holds and the pending phase does not', () => {
    const nextPhase = buildPhase(
      [
        { price: BASE_PRICE_ID, quantity: 3 },
        { price: CREDIT_PRICE_ID, quantity: 1 },
      ],
      PERIOD_END,
    );

    const { toUpdateNextPhase } = buildSchedulePhasesUpdate({
      currentPhase: buildPhase(
        [
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
          { price: PENDING_ONLY_PRICE_ID, quantity: 2 },
        ],
        1_700_000_000,
      ),
      nextPhase,
      productKeyByPriceId,
      toUpdateCurrentPrices: undefined,
      toUpdateNextPrices,
      subscriptionCurrentPeriodEnd: PERIOD_END,
    });

    expect(toUpdateNextPhase.items).toEqual([
      { price: 'price_base_year', quantity: 7 },
      { price: 'price_credit_year', quantity: 1 },
    ]);
  });

  it('falls back to the current phase when no schedule is pending yet', () => {
    const { toUpdateNextPhase } = buildSchedulePhasesUpdate({
      currentPhase,
      nextPhase: undefined,
      productKeyByPriceId,
      toUpdateCurrentPrices: undefined,
      toUpdateNextPrices,
      subscriptionCurrentPeriodEnd: PERIOD_END,
    });

    expect(toUpdateNextPhase.items).toEqual([
      { price: 'price_base_year', quantity: 7 },
      { price: 'price_credit_year', quantity: 1 },
    ]);
    expect(toUpdateNextPhase.start_date).toBe(PERIOD_END);
  });

  it('ends the current phase at the period boundary when its prices are unchanged', () => {
    const { toUpdateCurrentPhase } = buildSchedulePhasesUpdate({
      currentPhase,
      nextPhase: undefined,
      productKeyByPriceId,
      toUpdateCurrentPrices: undefined,
      toUpdateNextPrices,
      subscriptionCurrentPeriodEnd: PERIOD_END,
    });

    expect(toUpdateCurrentPhase.end_date).toBe(PERIOD_END);
    expect(toUpdateCurrentPhase.items).toEqual(currentPhase.items);
  });
});
