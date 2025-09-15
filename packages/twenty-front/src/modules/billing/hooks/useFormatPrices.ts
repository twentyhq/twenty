import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';

export const useFormatPrices = () => {
  const { getBaseLicensedPriceByPlanKeyAndInterval } = useBillingPlan();

  const formatPrices = () => {
    const enterpriseYearPrice = getBaseLicensedPriceByPlanKeyAndInterval(
      BillingPlanKey.ENTERPRISE,
      SubscriptionInterval.Year,
    );

    const enterpriseMonthPrice = getBaseLicensedPriceByPlanKeyAndInterval(
      BillingPlanKey.ENTERPRISE,
      SubscriptionInterval.Month,
    );

    const proYearPrice = getBaseLicensedPriceByPlanKeyAndInterval(
      BillingPlanKey.PRO,
      SubscriptionInterval.Year,
    );

    const proMonthPrice = getBaseLicensedPriceByPlanKeyAndInterval(
      BillingPlanKey.PRO,
      SubscriptionInterval.Month,
    );

    return {
      [BillingPlanKey.ENTERPRISE]: {
        [SubscriptionInterval.Year]: enterpriseYearPrice?.unitAmount / 100 / 12,
        [SubscriptionInterval.Month]: enterpriseMonthPrice?.unitAmount / 100,
      },
      [BillingPlanKey.PRO]: {
        [SubscriptionInterval.Year]: proYearPrice?.unitAmount / 100 / 12,
        [SubscriptionInterval.Month]: proMonthPrice?.unitAmount / 100,
      },
    };
  };

  return {
    formatPrices,
  };
};
