import { resolveSettingsBillingPlanPrices } from '@/settings/billing/utils/resolveSettingsBillingPlanPrices';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

describe('resolveSettingsBillingPlanPrices', () => {
  it('uses backend prices when they are defined', () => {
    const prices = resolveSettingsBillingPlanPrices({
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Month]: 25,
        [SubscriptionInterval.Year]: 19,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: 12,
        [SubscriptionInterval.Year]: 9,
      },
    });

    expect(prices.organization[SubscriptionInterval.Year]).toBe(19);
  });

  it('uses fallback prices when backend prices are not finite', () => {
    const prices = resolveSettingsBillingPlanPrices({
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Month]: Number.NaN,
        [SubscriptionInterval.Year]: Number.NaN,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Month]: Number.NaN,
        [SubscriptionInterval.Year]: Number.NaN,
      },
    });

    expect(prices.organization[SubscriptionInterval.Month]).toBe(25);
    expect(prices.organization[SubscriptionInterval.Year]).toBe(19);
    expect(prices.pro[SubscriptionInterval.Month]).toBe(12);
    expect(prices.pro[SubscriptionInterval.Year]).toBe(9);
  });
});
