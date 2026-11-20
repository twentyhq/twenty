import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { hasEveryIntervalPrice } from 'src/engine/core-modules/billing/utils/has-every-interval-price.util';

const buildPrice = ({
  interval,
  active = true,
}: {
  interval: SubscriptionInterval;
  active?: boolean;
}): Pick<BillingPriceEntity, 'interval' | 'active'> => ({ interval, active });

describe('hasEveryIntervalPrice', () => {
  it('is true when the product has an active price for every interval', () => {
    expect(
      hasEveryIntervalPrice({
        billingPrices: [
          buildPrice({ interval: SubscriptionInterval.Month }),
          buildPrice({ interval: SubscriptionInterval.Year }),
        ],
      }),
    ).toBe(true);
  });

  it('is false when an interval has no active price', () => {
    expect(
      hasEveryIntervalPrice({
        billingPrices: [
          buildPrice({ interval: SubscriptionInterval.Month }),
          buildPrice({ interval: SubscriptionInterval.Year, active: false }),
        ],
      }),
    ).toBe(false);
  });

  it('is false when the product is missing', () => {
    expect(hasEveryIntervalPrice(undefined)).toBe(false);
  });
});
