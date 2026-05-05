import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  BillingProductKey,
  type BillingPlanKey,
  type BillingPriceLicensed,
} from '~/generated-metadata/graphql';

export const useGetNextCreditPackPrice = (): BillingPriceLicensed | null => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { listPlans, isPlansLoaded } = usePlans();

  const items =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems;
  const interval = currentWorkspace?.currentBillingSubscription?.interval;
  const planKey = currentWorkspace?.currentBillingSubscription?.metadata?.[
    'plan'
  ] as BillingPlanKey | undefined;

  if (!items || !planKey || !isPlansLoaded) {
    return null;
  }

  const plans = listPlans();
  const currentPlan = plans.find((plan) => plan.planKey === planKey);

  if (!currentPlan) {
    return null;
  }

  const currentCreditPackItem = items.find(
    (item) =>
      item.billingProduct.metadata?.['productKey'] ===
      BillingProductKey.RESOURCE_CREDIT,
  );

  if (!currentCreditPackItem) {
    return null;
  }

  const creditPackPrices = currentPlan.resourceCreditProducts
    .flatMap((product) => product.prices ?? [])
    .filter(
      (price): price is BillingPriceLicensed =>
        price !== null && price !== undefined,
    );

  const pricesForInterval = creditPackPrices
    .filter((price) => price.recurringInterval === interval)
    .sort(
      (priceA, priceB) =>
        (priceA.creditAmount ?? 0) - (priceB.creditAmount ?? 0),
    );

  const currentIndex = pricesForInterval.findIndex(
    ({ stripePriceId }) =>
      stripePriceId === currentCreditPackItem.stripePriceId,
  );

  if (currentIndex === -1 || currentIndex === pricesForInterval.length - 1) {
    return null;
  }

  return pricesForInterval[currentIndex + 1];
};
