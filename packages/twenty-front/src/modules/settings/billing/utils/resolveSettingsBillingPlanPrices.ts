import { type useFormatPrices } from '@/settings/billing/hooks/useFormatPrices';
import { type SettingsBillingPlanPrices } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const CLOUD_PLAN_PRICE_FALLBACKS = {
  pro: {
    [SubscriptionInterval.Month]: 12,
    [SubscriptionInterval.Year]: 9,
  },
  organization: {
    [SubscriptionInterval.Month]: 25,
    [SubscriptionInterval.Year]: 19,
  },
} satisfies SettingsBillingPlanPrices;

const resolvePlanPrice = (price: number | null | undefined, fallback: number) =>
  typeof price === 'number' && Number.isFinite(price) ? price : fallback;

export const resolveSettingsBillingPlanPrices = (
  formatPrices: ReturnType<typeof useFormatPrices>['formatPrices'],
): SettingsBillingPlanPrices => ({
  organization: {
    [SubscriptionInterval.Month]: resolvePlanPrice(
      formatPrices[BillingPlanKey.ENTERPRISE]?.[SubscriptionInterval.Month],
      CLOUD_PLAN_PRICE_FALLBACKS.organization[SubscriptionInterval.Month],
    ),
    [SubscriptionInterval.Year]: resolvePlanPrice(
      formatPrices[BillingPlanKey.ENTERPRISE]?.[SubscriptionInterval.Year],
      CLOUD_PLAN_PRICE_FALLBACKS.organization[SubscriptionInterval.Year],
    ),
  },
  pro: {
    [SubscriptionInterval.Month]: resolvePlanPrice(
      formatPrices[BillingPlanKey.PRO]?.[SubscriptionInterval.Month],
      CLOUD_PLAN_PRICE_FALLBACKS.pro[SubscriptionInterval.Month],
    ),
    [SubscriptionInterval.Year]: resolvePlanPrice(
      formatPrices[BillingPlanKey.PRO]?.[SubscriptionInterval.Year],
      CLOUD_PLAN_PRICE_FALLBACKS.pro[SubscriptionInterval.Year],
    ),
  },
});
