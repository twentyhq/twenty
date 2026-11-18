import { useAllBillingPrices } from '@/settings/billing/hooks/useAllBillingPrices';
import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { splitPhaseItemsInPrices } from '@/settings/billing/utils/splitPhaseItemsInPrices';

export const useSplitPhaseItemsInPrices = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { allBillingPrices } = useAllBillingPrices();

  const splitedPhaseItemsInPrices = splitPhaseItemsInPrices({
    phaseItems: nextBillingPhase?.items ?? [],
    billingPrices: allBillingPrices,
  });

  return { splitedPhaseItemsInPrices };
};
