import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';

export const useNextInterval = () => {
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const nextInterval =
    splitedPhaseItemsInPrices.nextBasePrice?.recurringInterval;

  return { nextInterval };
};
