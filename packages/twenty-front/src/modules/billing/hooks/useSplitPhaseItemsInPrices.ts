import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';
import { usePriceAndBillingUsageByPriceId } from '@/billing/hooks/usePriceAndBillingUsageByPriceId';
import { type MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import {
  type BillingPriceLicensed,
  BillingUsageType,
} from '~/generated/graphql';

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
      nextLicensedPrice: BillingPriceLicensed | undefined;
    },
  );

  return { splitedPhaseItemsInPrices };
};
