import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { usePriceAndBillingUsageByPriceId } from '@/settings/billing/hooks/usePriceAndBillingUsageByPriceId';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingUsageType,
  type BillingPriceLicensed,
} from '~/generated-metadata/graphql';

export const useSplitPhaseItemsInPrices = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { getPriceAndBillingUsageByPriceId } =
    usePriceAndBillingUsageByPriceId();

  const splitedPhaseItemsInPrices = (nextBillingPhase?.items ?? []).reduce(
    (acc, item) => {
      const priceAndBillingUsage = getPriceAndBillingUsageByPriceId(item.price);

      if (priceAndBillingUsage?.billingUsage === BillingUsageType.LICENSED) {
        const licensedPrice = priceAndBillingUsage.price;
        if (isDefined(licensedPrice.creditAmount)) {
          acc.nextResourceCreditPrice = licensedPrice;
        } else {
          acc.nextBasePrice = licensedPrice;
        }
      }
      return acc;
    },
    {} as {
      nextBasePrice: BillingPriceLicensed | undefined;
      nextResourceCreditPrice: BillingPriceLicensed | undefined;
    },
  );

  return { splitedPhaseItemsInPrices };
};
