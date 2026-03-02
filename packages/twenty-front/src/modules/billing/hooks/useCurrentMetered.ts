import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentPlan } from '@/billing/hooks/useCurrentPlan';
import type { MeteredBillingPrice } from '@/billing/types/billing-price-tiers.type';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { assertIsDefinedOrThrow, findOrThrow } from 'twenty-shared/utils';
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
  const foundMeteredBillingPrice = meteredPrices.find(
    (price) =>
      price.stripePriceId ===
      currentMeteredBillingSubscriptionItem.stripePriceId,
  );
  if (!foundMeteredBillingPrice) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Billing] Subscription item references Stripe price "${currentMeteredBillingSubscriptionItem.stripePriceId}" which is absent from the active plan catalog. The price may have been archived or rotated in Stripe. Falling back to the first active metered price.`,
    );
  }
  const currentMeteredBillingPrice = (foundMeteredBillingPrice ??
    meteredPrices[0]) as MeteredBillingPrice;
  if (!currentMeteredBillingPrice) {
    throw new Error('[Billing] No active metered prices found in the plan catalog.');
  }

  return {
    currentMeteredBillingSubscriptionItem,
    currentMeteredBillingPrice,
    getCurrentMeteredPricesByInterval,
  };
};
