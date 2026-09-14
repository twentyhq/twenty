import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findCreditTierPriceForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/find-credit-tier-price-for-interval-or-throw.util';

const MONTHLY_CREDIT_AMOUNTS = [
  5000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000,
  2000000000, 5000000000, 10000000000,
];

const YEARLY_CREDIT_AMOUNTS = [
  50000000, 240000000, 600000000, 1200000000, 2400000000, 6000000000,
  12000000000, 24000000000, 60000000000, 120000000000,
];

const buildTier = ({
  interval,
  creditAmount,
  active = true,
}: {
  interval: SubscriptionInterval;
  creditAmount: number;
  active?: boolean;
}) => ({
  stripePriceId: `price_${interval}_${creditAmount}`,
  interval,
  active,
  metadata: { credit_amount: String(creditAmount) },
});

const buildLadder = (interval: SubscriptionInterval, creditAmounts: number[]) =>
  creditAmounts.map((creditAmount) => buildTier({ interval, creditAmount }));

const buildProduct = (
  billingPrices: ReturnType<typeof buildTier>[],
  productKey: BillingProductKey = BillingProductKey.RESOURCE_CREDIT,
) => ({
  stripeProductId: 'prod_resource_credit',
  metadata: { productKey },
  billingPrices,
});

const buildCatalogProduct = () =>
  buildProduct([
    ...buildLadder(SubscriptionInterval.Month, MONTHLY_CREDIT_AMOUNTS),
    ...buildLadder(SubscriptionInterval.Year, YEARLY_CREDIT_AMOUNTS),
  ]);

const findTier = (interval: SubscriptionInterval, creditAmount: number) =>
  buildCatalogProduct().billingPrices.find(
    (billingPrice) =>
      billingPrice.interval === interval &&
      billingPrice.metadata.credit_amount === String(creditAmount),
  );

describe('findCreditTierPriceForIntervalOrThrow', () => {
  it('matches the entry tier across intervals, where the yearly ladder is not twelve times the monthly one', () => {
    expect(
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: findTier(SubscriptionInterval.Month, 5000000)!,
        targetInterval: SubscriptionInterval.Year,
      }).stripePriceId,
    ).toBe('price_year_50000000');
  });

  it('matches a paid tier on its twelve times counterpart', () => {
    expect(
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: findTier(SubscriptionInterval.Month, 20000000)!,
        targetInterval: SubscriptionInterval.Year,
      }).stripePriceId,
    ).toBe('price_year_240000000');
  });

  it('matches the top tier', () => {
    expect(
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: findTier(SubscriptionInterval.Month, 10000000000)!,
        targetInterval: SubscriptionInterval.Year,
      }).stripePriceId,
    ).toBe('price_year_120000000000');
  });

  it('comes back to the tier it started from when switching back', () => {
    expect(
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: findTier(SubscriptionInterval.Year, 50000000)!,
        targetInterval: SubscriptionInterval.Month,
      }).stripePriceId,
    ).toBe('price_month_5000000');

    expect(
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: findTier(SubscriptionInterval.Year, 240000000)!,
        targetInterval: SubscriptionInterval.Month,
      }).stripePriceId,
    ).toBe('price_month_20000000');
  });

  it('skips an archived tier', () => {
    const product = buildProduct([
      buildTier({
        interval: SubscriptionInterval.Month,
        creditAmount: 20000000,
      }),
      buildTier({
        interval: SubscriptionInterval.Year,
        creditAmount: 240000000,
        active: false,
      }),
      buildTier({
        interval: SubscriptionInterval.Year,
        creditAmount: 600000000,
      }),
    ]);

    expect(
      findCreditTierPriceForIntervalOrThrow(product, {
        referencePrice: product.billingPrices[0],
        targetInterval: SubscriptionInterval.Year,
      }).stripePriceId,
    ).toBe('price_year_600000000');
  });

  it('throws when the product has no active tier at that interval', () => {
    const product = buildProduct(
      buildLadder(SubscriptionInterval.Month, MONTHLY_CREDIT_AMOUNTS),
    );

    expect(() =>
      findCreditTierPriceForIntervalOrThrow(product, {
        referencePrice: product.billingPrices[0],
        targetInterval: SubscriptionInterval.Year,
      }),
    ).toThrow(BillingException);
  });

  it('throws when the reference price carries no credit amount', () => {
    expect(() =>
      findCreditTierPriceForIntervalOrThrow(buildCatalogProduct(), {
        referencePrice: {
          stripePriceId: 'price_month_licensed',
          interval: SubscriptionInterval.Month,
          active: true,
          metadata: {},
        },
        targetInterval: SubscriptionInterval.Year,
      }),
    ).toThrow(BillingException);
  });

  it('refuses a product that is not priced in credit tiers', () => {
    const product = buildProduct(
      buildLadder(SubscriptionInterval.Year, YEARLY_CREDIT_AMOUNTS),
      BillingProductKey.BASE_PRODUCT,
    );

    expect(() =>
      findCreditTierPriceForIntervalOrThrow(product, {
        referencePrice: findTier(SubscriptionInterval.Month, 5000000)!,
        targetInterval: SubscriptionInterval.Year,
      }),
    ).toThrow(BillingException);
  });
});
