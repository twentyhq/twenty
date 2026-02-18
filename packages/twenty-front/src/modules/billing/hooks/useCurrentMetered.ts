import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentPlan } from '@/billing/hooks/useCurrentPlan';
import type { MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import { useRecoilValue } from 'recoil';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
import {
  BillingProductKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const useCurrentMetered = () => {
  const { currentPlan } = useCurrentPlan();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

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
  if (!items) throw new Error('billingSubscriptionItems is undefined');
  if (items.length !== 2) {
    throw new Error('billingSubscriptionItems must contain 2 items.');
  }

  const currentMeteredBillingSubscriptionItem = findOrThrow(
    items,
    (it) =>
      it.billingProduct.metadata?.['productKey'] ===
      BillingProductKey.WORKFLOW_NODE_EXECUTION,
    new Error('Metered billing subscription item not found'),
  );

  const meteredPrices = getCurrentMeteredPricesByInterval();
  const currentMeteredBillingPrice = findOrThrow(
    meteredPrices,
    (price) =>
      price.stripePriceId ===
      currentMeteredBillingSubscriptionItem.stripePriceId,
  ) as MeteredBillingPrice;

  return {
    currentMeteredBillingSubscriptionItem,
    currentMeteredBillingPrice,
    getCurrentMeteredPricesByInterval,
  };
};
