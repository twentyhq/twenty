import { usePlans } from '@/settings/billing/hooks/usePlans';

export const useAllBillingPrices = () => {
  const { listPlans } = usePlans();

  const allBillingPrices = listPlans().flatMap(
    ({ baseProducts, resourceCreditProducts }) =>
      [...baseProducts, ...resourceCreditProducts].flatMap(
        ({ prices }) => prices ?? [],
      ),
  );

  return { allBillingPrices };
};
