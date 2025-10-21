import { usePlans } from '@/billing/hooks/usePlans';
import {
  type BillingPriceLicensed,
  type BillingPriceMetered,
} from '~/generated/graphql';

export const useAllBillingPrices = () => {
  const { listPlans } = usePlans();

  const allBillingPrices = listPlans()
    .map(({ licensedProducts, meteredProducts }) => {
      return [...licensedProducts, ...meteredProducts].map(
        ({ prices }) => prices,
      );
    })
    .flat(2) as Array<BillingPriceLicensed | BillingPriceMetered>;

  return { allBillingPrices };
};
