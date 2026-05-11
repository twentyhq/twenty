import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import type { MeteredBillingPrice } from '@/settings/billing/types/billing-price-tiers.type';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import {
  BillingProductKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const useCurrentMetered = () => {
  const { currentPlan } = useCurrentPlan();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  assertIsDefinedOrThrow(currentWorkspace);

  const getCurrentMeteredPricesByInterval = (
    interval?: SubscriptionInterval | null,
  ): Array<MeteredBillingPrice> => {
    const meteredPrices = currentPlan.meteredProducts
      .map(({ prices }) => prices)
      .flat() as Array<MeteredBillingPrice>;

    return interval
      ? meteredPrices.filter((p) => p.recurringInterval === interval)
      : meteredPrices;
  };

  const items =
    currentWorkspace.currentBillingSubscription?.billingSubscriptionItems;

  const currentMeteredBillingSubscriptionItem =
    items?.find(
      (it) =>
        it.billingProduct.metadata?.['productKey'] ===
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
    ) ?? null;

  const meteredPrices = getCurrentMeteredPricesByInterval();
  const currentMeteredBillingPrice = currentMeteredBillingSubscriptionItem
    ? ((meteredPrices.find(
        (price) =>
          price.stripePriceId ===
          currentMeteredBillingSubscriptionItem.stripePriceId,
      ) ?? null) as MeteredBillingPrice | null)
    : null;

  return {
    currentMeteredBillingSubscriptionItem,
    currentMeteredBillingPrice,
    getCurrentMeteredPricesByInterval,
  };
};
