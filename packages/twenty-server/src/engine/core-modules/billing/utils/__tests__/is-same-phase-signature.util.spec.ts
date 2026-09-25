/* @license Enterprise */

import { isSamePhaseSignature } from 'src/engine/core-modules/billing/utils/is-same-phase-signature.util';

const BASE_PRICE_ID = 'price_base_month';
const CREDIT_PRICE_ID = 'price_credit_month';
const ADD_ON_PRICE_ID = 'price_add_on_month';

const buildPhase = (items: Array<{ price: string; quantity?: number }>) => ({
  start_date: 1_700_000_000,
  proration_behavior: 'none' as const,
  items,
});

describe('isSamePhaseSignature', () => {
  it('ignores item order', () => {
    expect(
      isSamePhaseSignature(
        buildPhase([
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
        ]),
        buildPhase([
          { price: CREDIT_PRICE_ID, quantity: 1 },
          { price: BASE_PRICE_ID, quantity: 3 },
        ]),
      ),
    ).toBe(true);
  });

  it('separates two phases that differ only by an extra item', () => {
    expect(
      isSamePhaseSignature(
        buildPhase([
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
        ]),
        buildPhase([
          { price: BASE_PRICE_ID, quantity: 3 },
          { price: CREDIT_PRICE_ID, quantity: 1 },
          { price: ADD_ON_PRICE_ID, quantity: 1 },
        ]),
      ),
    ).toBe(false);
  });

  it('separates two phases that differ by a quantity', () => {
    expect(
      isSamePhaseSignature(
        buildPhase([{ price: BASE_PRICE_ID, quantity: 3 }]),
        buildPhase([{ price: BASE_PRICE_ID, quantity: 4 }]),
      ),
    ).toBe(false);
  });

  it('separates two phases that differ by a price', () => {
    expect(
      isSamePhaseSignature(
        buildPhase([{ price: BASE_PRICE_ID, quantity: 3 }]),
        buildPhase([{ price: 'price_base_year', quantity: 3 }]),
      ),
    ).toBe(false);
  });

  it('separates an item carrying no quantity from the same item carrying one', () => {
    expect(
      isSamePhaseSignature(
        buildPhase([{ price: BASE_PRICE_ID }]),
        buildPhase([{ price: BASE_PRICE_ID, quantity: 1 }]),
      ),
    ).toBe(false);
  });
});
