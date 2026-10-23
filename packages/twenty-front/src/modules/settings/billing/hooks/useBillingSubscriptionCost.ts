import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useSplitPhaseItemsInPrices } from '@/settings/billing/hooks/useSplitPhaseItemsInPrices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { findBaseProductSubscriptionItem } from '@/settings/billing/utils/findBaseProductSubscriptionItem';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

export const useBillingSubscriptionCost = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscription = currentWorkspace?.currentBillingSubscription;

  const { currentResourceCreditSubscriptionItem } = useCurrentResourceCredit();
  const { splitedPhaseItemsInPrices } = useSplitPhaseItemsInPrices();

  const trialNextPhasePrices =
    subscription?.status === SubscriptionStatus.Trialing
      ? splitedPhaseItemsInPrices
      : undefined;

  const baseProductSubscriptionItem = findBaseProductSubscriptionItem(
    subscription?.billingSubscriptionItems,
  );

  const seats = baseProductSubscriptionItem?.quantity;

  // Subscription prices, not the catalog: superseded prices keep billing the workspaces on them.
  // Per-seat is per subscription interval (a full year for yearly), so subtotals match the charge.
  const perSeatAmountCents =
    trialNextPhasePrices?.nextBasePrice?.unitAmount ??
    baseProductSubscriptionItem?.unitAmount;

  const seatsSubtotalCents =
    isDefined(seats) && isDefined(perSeatAmountCents)
      ? seats * perSeatAmountCents
      : undefined;

  const creditsSubtotalCents =
    trialNextPhasePrices?.nextResourceCreditPrice?.unitAmount ??
    currentResourceCreditSubscriptionItem?.unitAmount;

  const totalCents =
    isDefined(seatsSubtotalCents) && isDefined(creditsSubtotalCents)
      ? seatsSubtotalCents + creditsSubtotalCents
      : undefined;

  const getTotalCentsWithCreditsAmountCents = (creditsAmountCents: number) =>
    isDefined(seatsSubtotalCents)
      ? seatsSubtotalCents + creditsAmountCents
      : undefined;

  return {
    seats,
    perSeatAmountCents,
    seatsSubtotalCents,
    creditsSubtotalCents,
    totalCents,
    getTotalCentsWithCreditsAmountCents,
  };
};
