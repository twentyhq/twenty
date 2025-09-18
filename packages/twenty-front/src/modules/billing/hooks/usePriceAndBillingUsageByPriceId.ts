import {
  type BillingPriceLicensedDto,
  type BillingPriceMeteredDto,
  BillingUsageType,
} from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';
import { useAllBillingPrices } from './useAllBillingPrices';

export const usePriceAndBillingUsageByPriceId = () => {
  const { allBillingPrices } = useAllBillingPrices();

  const getPriceAndBillingUsageByPriceId = (
    priceId: string,
  ):
    | {
        price: BillingPriceLicensedDto;
        billingUsage: BillingUsageType.LICENSED;
      }
    | {
        price: BillingPriceMeteredDto;
        billingUsage: BillingUsageType.METERED;
      } => {
    const licensed = allBillingPrices.find(
      (p) =>
        p.priceUsageType === BillingUsageType.LICENSED &&
        p.stripePriceId === priceId,
    ) as BillingPriceLicensedDto | undefined;

    if (isDefined(licensed))
      return { price: licensed, billingUsage: BillingUsageType.LICENSED };

    const metered = allBillingPrices.find(
      (p) =>
        p.priceUsageType === BillingUsageType.METERED &&
        p.stripePriceId === priceId,
    ) as BillingPriceMeteredDto | undefined;
    if (isDefined(metered))
      return { price: metered, billingUsage: BillingUsageType.METERED };

    throw new Error('Price not found');
  };

  return { getPriceAndBillingUsageByPriceId };
};
