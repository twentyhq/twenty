import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useBaseLicensedPriceByPlanKeyAndInterval } from '@/settings/billing/hooks/useBaseLicensedPriceByPlanKeyAndInterval';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { BillingProductKey } from '~/generated-metadata/graphql';

// Centralizes the monthly/yearly bill breakdown so the subscription card and
// the add-credits selector compute the same numbers from a single source.
export const useBillingSubscriptionCost = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const subscription = currentWorkspace?.currentBillingSubscription;

  const { currentPlan } = useCurrentPlan();
  const { getBaseLicensedPriceByPlanKeyAndInterval } =
    useBaseLicensedPriceByPlanKeyAndInterval();
  const { currentResourceCreditBillingPrice } = useCurrentResourceCredit();

  const interval = subscription?.interval;

  const seats = subscription?.billingSubscriptionItems?.find(
    (item) =>
      item.billingProduct.metadata.productKey ===
      BillingProductKey.BASE_PRODUCT,
  )?.quantity;

  // Per-seat amount is expressed at the subscription interval (full yearly
  // amount for yearly subscriptions), so subtotals match the actual charge.
  const perSeatAmountCents = isDefined(interval)
    ? getBaseLicensedPriceByPlanKeyAndInterval(currentPlan.planKey, interval)
        .unitAmount
    : undefined;

  const seatsSubtotalCents =
    isDefined(seats) && isDefined(perSeatAmountCents)
      ? seats * perSeatAmountCents
      : undefined;

  const creditsSubtotalCents = currentResourceCreditBillingPrice?.unitAmount;

  const totalCents =
    isDefined(seatsSubtotalCents) && isDefined(creditsSubtotalCents)
      ? seatsSubtotalCents + creditsSubtotalCents
      : undefined;

  const getTotalCentsWithCreditsAmountCents = (creditsAmountCents: number) =>
    isDefined(seatsSubtotalCents)
      ? seatsSubtotalCents + creditsAmountCents
      : undefined;

  return {
    interval,
    seats,
    perSeatAmountCents,
    seatsSubtotalCents,
    creditsSubtotalCents,
    totalCents,
    getTotalCentsWithCreditsAmountCents,
  };
};
