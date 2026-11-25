import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { findBaseProductSubscriptionItem } from '@/settings/billing/utils/findBaseProductSubscriptionItem';
import { BillingProductKey } from '~/generated-metadata/graphql';

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

  const applicationSubscriptionItems =
    subscription?.billingSubscriptionItems?.filter(
      (billingSubscriptionItem) =>
        billingSubscriptionItem.billingProduct.metadata.productKey ===
        BillingProductKey.APPLICATION,
    ) ?? [];

  const applicationsSubtotalCents = applicationSubscriptionItems.reduce(
    (subtotalCents, applicationSubscriptionItem) =>
      subtotalCents +
      (applicationSubscriptionItem.quantity ?? 0) *
        (applicationSubscriptionItem.unitAmount ?? 0),
    0,
  );

  const totalCents =
    isDefined(seatsSubtotalCents) && isDefined(creditsSubtotalCents)
      ? seatsSubtotalCents + creditsSubtotalCents + applicationsSubtotalCents
      : undefined;

  const getTotalCentsWithCreditsAmountCents = (creditsAmountCents: number) =>
    isDefined(seatsSubtotalCents)
      ? seatsSubtotalCents + creditsAmountCents + applicationsSubtotalCents
      : undefined;

  return {
    seats,
    perSeatAmountCents,
    seatsSubtotalCents,
    creditsSubtotalCents,
    applicationSubscriptionItems,
    applicationsSubtotalCents,
    totalCents,
    getTotalCentsWithCreditsAmountCents,
  };
};
