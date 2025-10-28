import { findOrThrow, isDefined } from 'twenty-shared/utils';
import { useSplitPhaseItemsInPrices } from '@/billing/hooks/useSplitPhaseItemsInPrices';
import { useNextBillingPhase } from '@/billing/hooks/useNextBillingPhase';

export const useNextBillingSeats = () => {
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();
  const { nextBillingPhase } = useNextBillingPhase();
  const nextLicensedPrice = splitedPhaseItemsInPrices.nextLicensedPrice;
  const nextBillingSeats =
    isDefined(nextLicensedPrice) && nextBillingPhase
      ? findOrThrow(
          nextBillingPhase?.items,
          ({ price }) => nextLicensedPrice.stripePriceId === price,
        ).quantity
      : undefined;

  return { nextBillingSeats };
};
