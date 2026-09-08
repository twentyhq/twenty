import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { BillingProductKey } from '~/generated-metadata/graphql';

// Centralizes the monthly/yearly bill breakdown so the subscription card and
// the add-credits selector compute the same numbers from a single source.
export const useBillingSubscriptionCost = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscription = currentWorkspace?.currentBillingSubscription;

  const { currentResourceCreditSubscriptionItem } = useCurrentResourceCredit();

  const baseProductSubscriptionItem =
    subscription?.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct.metadata.productKey ===
        BillingProductKey.BASE_PRODUCT,
    );

  const seats = baseProductSubscriptionItem?.quantity;

  // Amounts come from the subscription's own prices rather than the catalog:
  // superseded prices keep billing the workspaces already on them, so a
  // workspace would otherwise be shown a total it is not charged. Per-seat is
  // expressed at the subscription interval (full yearly amount for yearly
  // subscriptions), so subtotals match the actual charge.
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
