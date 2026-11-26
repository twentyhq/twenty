import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { computeApplicationsSubscriptionCost } from '@/settings/billing/utils/computeApplicationsSubscriptionCost';
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
  // Per-seat is per subscription interval (a full year for yearly), so subtotals match the charge.
  const perSeatAmountCents = baseProductSubscriptionItem?.unitAmount;

  const seatsSubtotalCents =
    isDefined(seats) && isDefined(perSeatAmountCents)
      ? seats * perSeatAmountCents
      : undefined;

  const creditsSubtotalCents =
    currentResourceCreditSubscriptionItem?.unitAmount;

  const {
    applicationSubscriptionItems,
    applicationsCount,
    applicationsSubtotalCents,
  } = computeApplicationsSubscriptionCost(
    subscription?.billingSubscriptionItems,
  );

  const totalCents =
    isDefined(seatsSubtotalCents) &&
    isDefined(creditsSubtotalCents) &&
    isDefined(applicationsSubtotalCents)
      ? seatsSubtotalCents + creditsSubtotalCents + applicationsSubtotalCents
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
    applicationSubscriptionItems,
    applicationsCount,
    applicationsSubtotalCents,
    totalCents,
    getTotalCentsWithCreditsAmountCents,
  };
};
