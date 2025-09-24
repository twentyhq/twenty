import { useSplitPhaseItemsInPrices } from '@/billing/hooks/useSplitPhaseItemsInPrices';
import { usePlanByPriceId } from '@/billing/hooks/usePlanByPriceId';

export const useNextPlan = () => {
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();
  const { getPlanByPriceId } = usePlanByPriceId();

  const nextPlan = splitedPhaseItemsInPrices.nextLicensedPrice
    ? getPlanByPriceId(
        splitedPhaseItemsInPrices.nextLicensedPrice.stripePriceId,
      )
    : undefined;

  return {
    nextPlan,
  };
};
