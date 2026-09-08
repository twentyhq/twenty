import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { findProductPriceForIntervalOrThrow } from 'src/engine/core-modules/billing/utils/find-product-price-for-interval-or-throw.util';

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
}) => ({
  stripePriceId,
  interval,
  active,
  metadata: isLegacy ? { isLegacy } : {},
});

const buildProduct = (billingPrices: ReturnType<typeof buildPrice>[]) => ({
  stripeProductId: 'prod_base',
  billingPrices,
});

describe('findProductPriceForIntervalOrThrow', () => {
  it('returns the price matching the target interval', () => {
    const yearly = buildPrice({
      stripePriceId: 'price_year',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findProductPriceForIntervalOrThrow(
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

  it('still resolves when the whole packaging is superseded, so a grandfathered workspace can switch interval', () => {
    const yearly = buildPrice({
      stripePriceId: 'price_legacy_year',
      interval: SubscriptionInterval.Year,
      isLegacy: 'true',
    });

    expect(
      findProductPriceForIntervalOrThrow(
        buildProduct([yearly]),
        SubscriptionInterval.Year,
      ),
    ).toBe(yearly);
  });

  it('prefers the current price when a superseded one shares the interval', () => {
    const current = buildPrice({
      stripePriceId: 'price_year_new',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findProductPriceForIntervalOrThrow(
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

  it('skips an archived price', () => {
    const current = buildPrice({
      stripePriceId: 'price_year',
      interval: SubscriptionInterval.Year,
    });

    expect(
      findProductPriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_year_archived',
            interval: SubscriptionInterval.Year,
            active: false,
          }),
          current,
        ]),
        SubscriptionInterval.Year,
      ),
    ).toBe(current);
  });

  it('throws when the product has no active price at that interval', () => {
    expect(() =>
      findProductPriceForIntervalOrThrow(
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

  it('throws rather than pick between two current prices at one interval', () => {
    expect(() =>
      findProductPriceForIntervalOrThrow(
        buildProduct([
          buildPrice({
            stripePriceId: 'price_year_a',
            interval: SubscriptionInterval.Year,
          }),
          buildPrice({
            stripePriceId: 'price_year_b',
            interval: SubscriptionInterval.Year,
          }),
        ]),
        SubscriptionInterval.Year,
      ),
    ).toThrow(/price_year_a, price_year_b/);
  });
});
