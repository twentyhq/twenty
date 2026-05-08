import { useNextBillingPhase } from '@/settings/billing/hooks/useNextBillingPhase';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { findOrThrow, isDefined } from 'twenty-shared/utils';

export const useNextBillingSeats = () => {
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();
  const { nextBillingPhase } = useNextBillingPhase();
  const nextBasePrice = splitedPhaseItemsInPrices.nextBasePrice;
  const nextBillingSeats =
    isDefined(nextBasePrice) && nextBillingPhase
      ? findOrThrow(
          nextBillingPhase?.items,
          ({ price }) => nextBasePrice.stripePriceId === price,
        ).quantity
      : undefined;

  return { nextBillingSeats };
};
