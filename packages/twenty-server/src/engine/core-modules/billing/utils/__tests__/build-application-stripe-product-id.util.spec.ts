import { buildApplicationStripeProductId } from 'src/engine/core-modules/billing/utils/build-application-stripe-product-id.util';

const params = {
  applicationUniversalIdentifier: 'application-universal-identifier',
  price: {
    universalIdentifier: 'b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21',
    amountCents: 1000,
  },
};

describe('buildApplicationStripeProductId', () => {
  it('builds the same id for the same declared price', () => {
    expect(buildApplicationStripeProductId(params)).toBe(
      buildApplicationStripeProductId({
        ...params,
        price: { ...params.price },
      }),
    );
    expect(buildApplicationStripeProductId(params)).toMatch(
      /^app_price_[0-9a-f]{32}$/,
    );
  });

  it.each([
    [
      'another application',
      { ...params, applicationUniversalIdentifier: 'other-application' },
    ],
    [
      'another price',
      {
        ...params,
        price: {
          ...params.price,
          universalIdentifier: 'c1f5a3d2-7b64-4e89-9a10-2d8f6e4b3c57',
        },
      },
    ],
    [
      'another amount',
      { ...params, price: { ...params.price, amountCents: 1200 } },
    ],
  ])('builds a different id for %s', (_, otherParams) => {
    expect(buildApplicationStripeProductId(otherParams)).not.toBe(
      buildApplicationStripeProductId(params),
    );
  });
});
