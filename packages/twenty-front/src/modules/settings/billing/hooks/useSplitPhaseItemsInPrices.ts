import { useAllBillingPrices } from '@/settings/billing/hooks/useAllBillingPrices';
import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { splitPhaseItemsInPricesOrThrow } from '@/settings/billing/utils/splitPhaseItemsInPricesOrThrow';
import { isDefined } from 'twenty-shared/utils';

export const useSplitPhaseItemsInPrices = () => {
  const { nextBillingPhase } = useNextBillingPhase();
  const { allBillingPrices } = useAllBillingPrices();

  const splitedPhaseItemsInPrices: Partial<
    ReturnType<typeof splitPhaseItemsInPricesOrThrow>
  > = isDefined(nextBillingPhase)
    ? splitPhaseItemsInPricesOrThrow({
        phaseItems: nextBillingPhase.items,
        billingPrices: allBillingPrices,
      })
    : {};

  return { splitedPhaseItemsInPrices };
};
