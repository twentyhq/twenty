import { usePlans } from '@/billing/hooks/usePlans';

export const useListProducts = () => {
  const { listPlans } = usePlans();

  const listProducts = () =>
    listPlans().flatMap((plan) => [
      ...plan.licensedProducts,
      ...plan.meteredProducts,
    ]);

  return { listProducts };
};
