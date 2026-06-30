import { usePlanByPriceId } from '@/settings/billing/hooks/usePlanByPriceId';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';

export const useNextPlan = () => {
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();
  const { getPlanByPriceId } = usePlanByPriceId();

  const nextPlan = splitedPhaseItemsInPrices.nextBasePrice
    ? getPlanByPriceId(splitedPhaseItemsInPrices.nextBasePrice.stripePriceId)
    : undefined;

  return {
    nextPlan,
  };
};
