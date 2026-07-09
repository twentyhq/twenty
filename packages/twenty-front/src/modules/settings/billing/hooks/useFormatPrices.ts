import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import { SETTINGS_BILLING_PLAN_PRICE_FALLBACKS } from '@/settings/billing/constants/SettingsBillingPlanPriceFallbacks';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { type SettingsBillingPlanPrices } from '@/settings/billing/types/settingsBillingPlanComparison.type';

export const useFormatPrices = () => {
  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

  const getFormattedPrice = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval.Month | SubscriptionInterval.Year,
  ) => {
    try {
      const price = getBaseLicensedPriceByPlanKeyAndInterval(planKey, interval);
      const formattedPrice =
        price.unitAmount /
        100 /
        (interval === SubscriptionInterval.Year ? 12 : 1);

      return Number.isFinite(formattedPrice)
        ? formattedPrice
        : SETTINGS_BILLING_PLAN_PRICE_FALLBACKS[planKey][interval];
    } catch {
      return SETTINGS_BILLING_PLAN_PRICE_FALLBACKS[planKey][interval];
    }
  };

  const formatPrices: SettingsBillingPlanPrices = {
    [BillingPlanKey.ENTERPRISE]: {
      [SubscriptionInterval.Year]: getFormattedPrice(
        BillingPlanKey.ENTERPRISE,
        SubscriptionInterval.Year,
      ),
      [SubscriptionInterval.Month]: getFormattedPrice(
        BillingPlanKey.ENTERPRISE,
        SubscriptionInterval.Month,
      ),
    },
    [BillingPlanKey.PRO]: {
      [SubscriptionInterval.Year]: getFormattedPrice(
        BillingPlanKey.PRO,
        SubscriptionInterval.Year,
      ),
      [SubscriptionInterval.Month]: getFormattedPrice(
        BillingPlanKey.PRO,
        SubscriptionInterval.Month,
      ),
    },
  };

  return {
    formatPrices,
  };
};
