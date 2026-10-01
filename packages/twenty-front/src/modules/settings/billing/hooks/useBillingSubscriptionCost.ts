import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { findBaseProductSubscriptionItem } from '@/settings/billing/utils/findBaseProductSubscriptionItem';

export const useBillingSubscriptionCost = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscription = currentWorkspace?.currentBillingSubscription;

  const { currentResourceCreditSubscriptionItem } = useCurrentResourceCredit();

  const baseProductSubscriptionItem = findBaseProductSubscriptionItem(
    subscription?.billingSubscriptionItems,
  );

  const seats = baseProductSubscriptionItem?.quantity;

  // Subscription prices, not the catalog: superseded prices keep billing the workspaces on them.
  const perSeatAmountCents = baseProductSubscriptionItem?.unitAmount;

  const seatsSubtotalCents =
    isDefined(seats) && isDefined(perSeatAmountCents)
      ? seats * perSeatAmountCents
      : undefined;

  const creditsSubtotalCents =
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
