import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { usePriceAndBillingUsageByPriceId } from '@/settings/billing/hooks/usePriceAndBillingUsageByPriceId';
import { type MeteredBillingPrice } from '@/settings/billing/types/billing-price-tiers.type';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingUsageType,
  FeatureFlagKey,
  type BillingPriceLicensed,
} from '~/generated-metadata/graphql';

export const useSplitPhaseItemsInPrices = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { getPriceAndBillingUsageByPriceId } =
    usePriceAndBillingUsageByPriceId();
  const isV2 = useIsFeatureEnabled(FeatureFlagKey.IS_BILLING_V2_ENABLED);

  const splitedPhaseItemsInPrices = (nextBillingPhase?.items ?? []).reduce(
    (acc, item) => {
      const { price, billingUsage } = getPriceAndBillingUsageByPriceId(
        item.price,
      );

      if (isV2) {
        if (billingUsage === BillingUsageType.LICENSED) {
          const licensedPrice = price as BillingPriceLicensed;
          if (isDefined(licensedPrice.creditAmount)) {
            acc.nextResourceCreditPrice = licensedPrice;
          } else {
            acc.nextBasePrice = licensedPrice;
          }
        }
      } else {
        if (billingUsage === BillingUsageType.LICENSED) {
          acc.nextBasePrice = price;
        }
        if (billingUsage === BillingUsageType.METERED) {
          acc.nextMeteredPrice = price as MeteredBillingPrice;
        }
      }
      return acc;
    },
    {} as {
      nextMeteredPrice: MeteredBillingPrice | undefined;
      nextBasePrice: BillingPriceLicensed | undefined;
      nextResourceCreditPrice: BillingPriceLicensed | undefined;
    },
  );

  return { splitedPhaseItemsInPrices };
};
