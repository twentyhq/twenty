import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import type { MeteredBillingPrice } from '@/settings/billing/types/billing-price-tiers.type';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type BillingPlanKey,
  BillingProductKey,
} from '~/generated-metadata/graphql';

export const useGetNextMeteredBillingPrice = (): MeteredBillingPrice | null => {
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

  const currentMeteredItem = items.find(
    (item) =>
      item.billingProduct.metadata?.['productKey'] ===
      BillingProductKey.WORKFLOW_NODE_EXECUTION,
  );
  if (!currentMeteredItem) {
    return null;
  }

  const meteredPrices = currentPlan.meteredProducts.flatMap(
    ({ prices }) => prices,
  ) as Array<MeteredBillingPrice>;

  const pricesForInterval = meteredPrices
    .filter((price) => price.recurringInterval === interval)
    .sort(
      (priceA, priceB) =>
        priceA.tiers[0].flatAmount - priceB.tiers[0].flatAmount,
    );

  const currentIndex = pricesForInterval.findIndex(
    ({ stripePriceId }) => stripePriceId === currentMeteredItem.stripePriceId,
  );

  if (currentIndex === -1 || currentIndex === pricesForInterval.length - 1) {
    return null;
  }

  return pricesForInterval[currentIndex + 1];
};
