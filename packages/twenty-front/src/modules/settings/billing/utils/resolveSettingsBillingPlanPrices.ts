import { type useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

// Displayed while Stripe prices are unavailable, mirroring twenty.com pricing.
export const SETTINGS_BILLING_PLAN_PRICE_FALLBACKS = {
  [BillingPlanKey.PRO]: {
    [SubscriptionInterval.Month]: 12,
    [SubscriptionInterval.Year]: 9,
  },
  [BillingPlanKey.ENTERPRISE]: {
    [SubscriptionInterval.Month]: 25,
    [SubscriptionInterval.Year]: 19,
  },
} satisfies SettingsBillingPlanPrices;

export const resolveSettingsBillingPlanPrices = (
  formatPrices: ReturnType<typeof useFormatPrices>['formatPrices'],
): SettingsBillingPlanPrices => {
  const resolvePlanPrice = (
    planKey: BillingPlanKey,
    interval: SettingsBillingPlanInterval,
  ) => {
    const price = formatPrices[planKey][interval];

    return Number.isFinite(price)
      ? price
      : SETTINGS_BILLING_PLAN_PRICE_FALLBACKS[planKey][interval];
  };

  return {
    [BillingPlanKey.PRO]: {
      [SubscriptionInterval.Month]: resolvePlanPrice(
        BillingPlanKey.PRO,
        SubscriptionInterval.Month,
      ),
      [SubscriptionInterval.Year]: resolvePlanPrice(
        BillingPlanKey.PRO,
        SubscriptionInterval.Year,
      ),
    },
    [BillingPlanKey.ENTERPRISE]: {
      [SubscriptionInterval.Month]: resolvePlanPrice(
        BillingPlanKey.ENTERPRISE,
        SubscriptionInterval.Month,
      ),
      [SubscriptionInterval.Year]: resolvePlanPrice(
        BillingPlanKey.ENTERPRISE,
        SubscriptionInterval.Year,
      ),
    },
  };
};
