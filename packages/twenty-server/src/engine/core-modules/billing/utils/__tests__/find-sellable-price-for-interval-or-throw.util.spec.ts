import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findSellablePriceForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/find-sellable-price-for-interval-or-throw.util';

const buildPrice = ({
  stripePriceId,
  interval,
  active = true,
  isLegacy,
}: {
  stripePriceId: string;
  interval: SubscriptionInterval;
  active?: boolean;
  isLegacy?: string;
}) =>
  ({
    stripePriceId,
    interval,
    active,
    metadata: isLegacy ? { isLegacy } : {},
  }) as unknown as BillingPriceEntity;

const buildProduct = (
  billingPrices: BillingPriceEntity[],
  { isLegacy }: { isLegacy?: string } = {},
) =>
  ({
    stripeProductId: 'prod_base',
    active: true,
    metadata: isLegacy ? { isLegacy } : {},
    billingPrices,
  }) as unknown as BillingProductEntity;

describe('findSellablePriceForIntervalOrThrow', () => {
  it('returns the price matching the target interval', () => {
    const yearly = buildPrice({
      stripePriceId: 'price_year',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findSellablePriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_month',
            interval: SubscriptionInterval.Month,
          }),
          yearly,
        ]),
        SubscriptionInterval.Year,
      ),
    ).toBe(yearly);
  });

  it('resolves on a legacy product, so a grandfathered workspace keeps its packaging', () => {
    const yearly = buildPrice({
      stripePriceId: 'price_legacy_year',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findSellablePriceForIntervalOrThrow(
        buildProduct([yearly], { isLegacy: 'true' }),
        SubscriptionInterval.Year,
      ),
    ).toBe(yearly);
  });

  it('skips a superseded price on the product', () => {
    const current = buildPrice({
      stripePriceId: 'price_year_new',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findSellablePriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_year_old',
            interval: SubscriptionInterval.Year,
            isLegacy: 'true',
          }),
          current,
        ]),
        SubscriptionInterval.Year,
      ),
    ).toBe(current);
  });

  it('throws when the product has no price at that interval', () => {
    expect(() =>
      findSellablePriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_month',
            interval: SubscriptionInterval.Month,
          }),
        ]),
        SubscriptionInterval.Year,
      ),
    ).toThrow(BillingException);
  });

  it('throws rather than pick between two sellable prices at the same interval', () => {
    expect(() =>
      findSellablePriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_year_old',
            interval: SubscriptionInterval.Year,
          }),
          buildPrice({
            stripePriceId: 'price_year_new',
            interval: SubscriptionInterval.Year,
          }),
        ]),
        SubscriptionInterval.Year,
      ),
    ).toThrow(/price_year_old, price_year_new/);
  });
});
