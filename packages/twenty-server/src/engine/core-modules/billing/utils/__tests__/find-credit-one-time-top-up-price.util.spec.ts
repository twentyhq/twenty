/* @license Enterprise */

import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findCreditOneTimeTopUpPrice } from 'src/engine/core-modules/billing/utils/find-credit-one-time-top-up-price.util';

const buildPrice = (
  overrides: Partial<BillingPriceEntity> & { creditAmountMicro?: string },
): BillingPriceEntity => {
  const { creditAmountMicro = '20000000', ...rest } = overrides;

  return {
    stripePriceId: 'price_20',
    active: true,
    interval: SubscriptionInterval.Month,
    currency: 'USD',
    unitAmount: 2_000,
    metadata: { credit_amount: creditAmountMicro },
    ...rest,
  } as BillingPriceEntity;
};

const buildSubscription = ({
  billingPrices,
  productKey = BillingProductKey.RESOURCE_CREDIT,
}: {
  billingPrices: BillingPriceEntity[];
  productKey?: BillingProductKey;
}) =>
  ({
    interval: SubscriptionInterval.Month,
    currency: 'USD',
    billingSubscriptionItems: [
      { billingProduct: { metadata: { productKey }, billingPrices } },
    ],
  }) as unknown as BillingSubscriptionEntity;

describe('findCreditOneTimeTopUpPrice', () => {
  it('takes the cheapest rate per credit, not the cheapest tier', () => {
    const price = findCreditOneTimeTopUpPrice(
      buildSubscription({
        billingPrices: [
          buildPrice({ stripePriceId: 'price_small', unitAmount: 2_000 }),
          buildPrice({
            stripePriceId: 'price_large',
            unitAmount: 5_000,
            creditAmountMicro: '100000000',
          }),
        ],
      }),
    );

    expect(price?.stripePriceId).toBe('price_large');
  });

  it('never prices at the free tier', () => {
    const price = findCreditOneTimeTopUpPrice(
      buildSubscription({
        billingPrices: [
          buildPrice({
            stripePriceId: 'price_free',
            unitAmount: 0,
            creditAmountMicro: '5000000',
          }),
          buildPrice({ stripePriceId: 'price_20' }),
        ],
      }),
    );

    expect(price?.stripePriceId).toBe('price_20');
  });

  it('skips archived, legacy, other-interval and other-currency prices', () => {
    const price = findCreditOneTimeTopUpPrice(
      buildSubscription({
        billingPrices: [
          buildPrice({
            stripePriceId: 'price_archived',
            active: false,
            unitAmount: 1,
          }),
          buildPrice({
            stripePriceId: 'price_legacy',
            unitAmount: 1,
            metadata: { credit_amount: '20000000', isLegacy: 'true' },
          }),
          buildPrice({
            stripePriceId: 'price_yearly',
            interval: SubscriptionInterval.Year,
            unitAmount: 1,
          }),
          buildPrice({
            stripePriceId: 'price_eur',
            currency: 'EUR',
            unitAmount: 1,
          }),
          buildPrice({ stripePriceId: 'price_20' }),
        ],
      }),
    );

    expect(price?.stripePriceId).toBe('price_20');
  });

  it('matches the currency whatever its case', () => {
    const price = findCreditOneTimeTopUpPrice(
      buildSubscription({
        billingPrices: [
          buildPrice({ stripePriceId: 'price_20', currency: 'usd' }),
        ],
      }),
    );

    expect(price?.stripePriceId).toBe('price_20');
  });

  it('finds nothing without a resource credit item', () => {
    expect(
      findCreditOneTimeTopUpPrice(
        buildSubscription({
          billingPrices: [buildPrice({})],
          productKey: BillingProductKey.BASE_PRODUCT,
        }),
      ),
    ).toBeUndefined();
  });

  it('finds nothing when every tier is free', () => {
    expect(
      findCreditOneTimeTopUpPrice(
        buildSubscription({ billingPrices: [buildPrice({ unitAmount: 0 })] }),
      ),
    ).toBeUndefined();
  });
});
