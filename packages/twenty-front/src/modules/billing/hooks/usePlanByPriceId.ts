import { findOrThrow } from 'twenty-shared/utils';
import { usePlans } from './usePlans';

export const usePlanByPriceId = () => {
  const { listPlans } = usePlans();

  const getPlanByPriceId = (priceId: string) =>
    findOrThrow(
      listPlans(),
      (plan) =>
        plan.licensedProducts.some((p) =>
          p.prices?.some((price) => price.stripePriceId === priceId),
        ) ||
        plan.meteredProducts.some((p) =>
          p.prices?.some((price) => price.stripePriceId === priceId),
        ),
    );

  return { getPlanByPriceId };
};
