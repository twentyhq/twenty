import {
  type BillingPriceLicensedDto,
  type BillingPriceMeteredDto,
} from '~/generated/graphql';
import { usePlans } from '@/billing/hooks/usePlans';

export const useAllBillingPrices = () => {
  const { listPlans } = usePlans();

  const allBillingPrices = listPlans()
    .map(({ licensedProducts, meteredProducts }) => {
      return [...licensedProducts, ...meteredProducts].map(
        ({ prices }) => prices,
      );
    })
    .flat(2) as Array<BillingPriceLicensedDto | BillingPriceMeteredDto>;

  return { allBillingPrices };
};
