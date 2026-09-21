import { findSellablePriceForIntervalOrThrow } from '@/settings/billing/utils/findSellablePriceForIntervalOrThrow';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

const buildPrice = (
  stripePriceId: string,
  recurringInterval: SubscriptionInterval,
  isSellable = true,
) => ({ stripePriceId, recurringInterval, isSellable });

describe('findSellablePriceForIntervalOrThrow', () => {
  it('returns the sellable price at the interval', () => {
    const yearly = buildPrice('price_year', SubscriptionInterval.Year);

    expect(
      findSellablePriceForIntervalOrThrow(
        [buildPrice('price_month', SubscriptionInterval.Month), yearly],
        SubscriptionInterval.Year,
      ),
    ).toBe(yearly);
  });

  it('skips a superseded price at the same interval', () => {
    const current = buildPrice('price_new', SubscriptionInterval.Year);

    expect(
      findSellablePriceForIntervalOrThrow(
        [buildPrice('price_old', SubscriptionInterval.Year, false), current],
        SubscriptionInterval.Year,
      ),
    ).toBe(current);
  });

  it('throws rather than pick between two sellable prices at one interval', () => {
    expect(() =>
      findSellablePriceForIntervalOrThrow(
        [
          buildPrice('price_old', SubscriptionInterval.Year),
          buildPrice('price_new', SubscriptionInterval.Year),
        ],
        SubscriptionInterval.Year,
      ),
    ).toThrow(/price_old, price_new/);
  });

  it('throws when no price matches the interval', () => {
    expect(() =>
      findSellablePriceForIntervalOrThrow(
        [buildPrice('price_month', SubscriptionInterval.Month)],
        SubscriptionInterval.Year,
      ),
    ).toThrow(/found 0/);
  });
});
