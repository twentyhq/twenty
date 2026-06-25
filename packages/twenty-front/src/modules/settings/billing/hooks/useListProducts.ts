import { usePlans } from '@/settings/billing/hooks/usePlans';

export const useListProducts = () => {
  const { listPlans } = usePlans();

  const listProducts = () =>
    listPlans().flatMap((plan) => [
      ...plan.baseProducts,
      ...plan.resourceCreditProducts,
      ...plan.meteredProducts,
    ]);

  return { listProducts };
};
