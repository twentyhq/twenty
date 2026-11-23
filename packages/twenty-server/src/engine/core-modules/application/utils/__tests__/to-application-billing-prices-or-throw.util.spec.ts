import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { toApplicationBillingPricesOrThrow } from 'src/engine/core-modules/application/utils/to-application-billing-prices-or-throw.util';

const price: ApplicationBillingPrice = {
  universalIdentifier: 'b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21',
  label: 'Platform fee',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
};

const otherPrice: ApplicationBillingPrice = {
  ...price,
  universalIdentifier: 'c1f5a3d2-7b64-4e89-9a10-2d8f6e4b3c57',
};

describe('toApplicationBillingPricesOrThrow', () => {
  it('returns no price when none is declared', () => {
    expect(toApplicationBillingPricesOrThrow(undefined)).toEqual([]);
    expect(toApplicationBillingPricesOrThrow(null)).toEqual([]);
  });

  it('returns valid prices as they are', () => {
    expect(toApplicationBillingPricesOrThrow([price, otherPrice])).toEqual([
      price,
      otherPrice,
    ]);
  });

  it.each<[string, unknown]>([
    ['are not a list', { prices: [price] }],
    ['hold a negative amount', [{ ...price, amountCents: -1 }]],
    ['hold an unknown unit', [{ ...price, per: 'SEAT' }]],
    [
      'hold an identifier that is not a uuid',
      [{ ...price, universalIdentifier: 'fee' }],
    ],
    ['repeat a universal identifier', [price, price]],
    [
      'repeat a universal identifier with another amount',
      [price, { ...price, amountCents: 2000 }],
    ],
  ])('throws when the prices %s', (_, prices) => {
    expect(() => toApplicationBillingPricesOrThrow(prices)).toThrow(
      'Invalid or duplicated application billing prices',
    );
  });
});
