/* @license Enterprise */

import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { buildPhaseUpdateParams } from 'src/engine/core-modules/billing/utils/build-phase-update-params.util';

const BASE_PRICE_ID = 'price_base_month';
const CREDIT_PRICE_ID = 'price_credit_month';
const ADD_ON_PRICE_ID = 'price_add_on_month';

const productKeyByPriceId = new Map([
  [BASE_PRICE_ID, BillingProductKey.BASE_PRODUCT],
  [CREDIT_PRICE_ID, BillingProductKey.RESOURCE_CREDIT],
]);

const toUpdatePrices = {
  baseProductPriceId: 'price_base_year',
  seats: 7,
  resourceCreditPriceId: 'price_credit_year',
};

const PHASE_START = 1_700_000_000;
const NEW_START = 1_750_000_000;

const buildPhase = (items: Array<{ price: string; quantity?: number }>) => ({
  start_date: PHASE_START,
  proration_behavior: 'none' as const,
  items,
});

describe('buildPhaseUpdateParams', () => {
  it('rewrites the base and credit items and leaves an unclassified item untouched', () => {
    const phase = buildPhaseUpdateParams({
      currentPhase: buildPhase([
        { price: BASE_PRICE_ID, quantity: 3 },
        { price: CREDIT_PRICE_ID, quantity: 1 },
        { price: ADD_ON_PRICE_ID, quantity: 1 },
      ]),
      productKeyByPriceId,
      toUpdatePrices,
      startDate: NEW_START,
      endDate: undefined,
    });

    expect(phase.start_date).toBe(NEW_START);
    expect(phase.items).toEqual([
      { price: 'price_base_year', quantity: 7 },
      { price: 'price_credit_year', quantity: 1 },
      { price: ADD_ON_PRICE_ID, quantity: 1 },
    ]);
  });

  it('keeps an unclassified item whatever its position', () => {
    const phase = buildPhaseUpdateParams({
      currentPhase: buildPhase([
        { price: ADD_ON_PRICE_ID, quantity: 1 },
        { price: BASE_PRICE_ID, quantity: 3 },
        { price: CREDIT_PRICE_ID, quantity: 1 },
      ]),
      productKeyByPriceId,
      toUpdatePrices,
      startDate: NEW_START,
      endDate: undefined,
    });

    expect(phase.items?.[0]).toEqual({ price: ADD_ON_PRICE_ID, quantity: 1 });
  });

  it('keeps an item whose price the catalog does not know', () => {
    const phase = buildPhaseUpdateParams({
      currentPhase: buildPhase([
        { price: BASE_PRICE_ID, quantity: 3 },
        { price: CREDIT_PRICE_ID, quantity: 1 },
        { price: 'price_never_synced', quantity: 2 },
      ]),
      productKeyByPriceId,
      toUpdatePrices,
      startDate: NEW_START,
      endDate: undefined,
    });

    expect(phase.items?.[2]).toEqual({
      price: 'price_never_synced',
      quantity: 2,
    });
  });

  it('throws when the resource credit price is missing from the catalog', () => {
    expect(() =>
      buildPhaseUpdateParams({
        currentPhase: buildPhase([
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
        ]),
        productKeyByPriceId: new Map([
          [BASE_PRICE_ID, BillingProductKey.BASE_PRODUCT],
        ]),
        toUpdatePrices,
        startDate: NEW_START,
        endDate: undefined,
      }),
    ).toThrow('Subscription schedule phase has no resource credit item');
  });

  it('throws when the phase carries no base product item', () => {
    expect(() =>
      buildPhaseUpdateParams({
        currentPhase: buildPhase([{ price: CREDIT_PRICE_ID, quantity: 1 }]),
        productKeyByPriceId,
        toUpdatePrices,
        startDate: NEW_START,
        endDate: undefined,
      }),
    ).toThrow('Subscription schedule phase has no base product item');
  });

  it('throws when the base product price is missing from the catalog', () => {
    expect(() =>
      buildPhaseUpdateParams({
        currentPhase: buildPhase([
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
        ]),
        productKeyByPriceId: new Map(),
        toUpdatePrices,
        startDate: NEW_START,
        endDate: undefined,
      }),
    ).toThrow('Subscription schedule phase has no base product item');
  });

  it('sets the end date only when one is given', () => {
    const currentPhase = buildPhase([
      { price: BASE_PRICE_ID, quantity: 3 },
      { price: CREDIT_PRICE_ID, quantity: 1 },
    ]);

    const withoutEndDate = buildPhaseUpdateParams({
      currentPhase,
      productKeyByPriceId,
      toUpdatePrices,
      startDate: NEW_START,
      endDate: undefined,
    });

    const withEndDate = buildPhaseUpdateParams({
      currentPhase,
      productKeyByPriceId,
      toUpdatePrices,
      startDate: NEW_START,
      endDate: 1_800_000_000,
    });

    expect(withoutEndDate.end_date).toBeUndefined();
    expect(withEndDate.end_date).toBe(1_800_000_000);
  });
});
