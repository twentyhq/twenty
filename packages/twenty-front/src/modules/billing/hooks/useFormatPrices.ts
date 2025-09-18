import { BillingPlanKey, SubscriptionInterval } from '~/generated/graphql';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';

export const useFormatPrices = () => {
  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();

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

  const formatPrices = {
    [BillingPlanKey.ENTERPRISE]: {
      [SubscriptionInterval.Year]: enterpriseYearPrice?.unitAmount / 100 / 12,
      [SubscriptionInterval.Month]: enterpriseMonthPrice?.unitAmount / 100,
    },
    [BillingPlanKey.PRO]: {
      [SubscriptionInterval.Year]: proYearPrice?.unitAmount / 100 / 12,
      [SubscriptionInterval.Month]: proMonthPrice?.unitAmount / 100,
    },
  };

  return {
    formatPrices,
  };
};
