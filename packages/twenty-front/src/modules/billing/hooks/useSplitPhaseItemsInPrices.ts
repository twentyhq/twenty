import {
  type BillingPriceLicensedDto,
  BillingUsageType,
} from '~/generated/graphql';
import { type MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import { usePriceAndBillingUsageByPriceId } from '@/billing/hooks/usePriceAndBillingUsageByPriceId';
import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';

export const useSplitPhaseItemsInPrices = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { getPriceAndBillingUsageByPriceId } =
    usePriceAndBillingUsageByPriceId();

  const splitedPhaseItemsInPrices = (nextBillingPhase?.items ?? []).reduce(
    (acc, item) => {
      const { price, billingUsage } = getPriceAndBillingUsageByPriceId(
        item.price,
      );
      if (billingUsage === BillingUsageType.LICENSED) {
        acc.nextLicensedPrice = price;
      }
      if (billingUsage === BillingUsageType.METERED) {
        acc.nextMereredPrice = price as MeteredBillingPrice;
      }
      return acc;
    },
    {} as {
      nextMereredPrice: MeteredBillingPrice | undefined;
      nextLicensedPrice: BillingPriceLicensedDto | undefined;
    },
  );

  return { splitedPhaseItemsInPrices };
};
