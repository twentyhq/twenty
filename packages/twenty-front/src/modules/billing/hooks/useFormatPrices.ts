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

  const formatAmount = (amountInCents: number | undefined) => {
    if (typeof amountInCents !== 'number' || Number.isNaN(amountInCents)) {
      return undefined;
    }

    return (amountInCents / 100).toFixed(2);
  };

  const formatPrices = {
    [BillingPlanKey.ENTERPRISE]: {
      [SubscriptionInterval.Year]: formatAmount(
        enterpriseYearPrice?.unitAmount / 12,
      ),
      [SubscriptionInterval.Month]: formatAmount(
        enterpriseMonthPrice?.unitAmount,
      ),
    },
    [BillingPlanKey.PRO]: {
      [SubscriptionInterval.Year]: formatAmount(proYearPrice?.unitAmount / 12),
      [SubscriptionInterval.Month]: formatAmount(proMonthPrice?.unitAmount),
    },
  };

  return {
    formatPrices,
  };
};
