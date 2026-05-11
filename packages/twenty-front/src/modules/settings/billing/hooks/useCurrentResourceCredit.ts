import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCurrentPlan } from '@/settings/billing/hooks/useCurrentPlan';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingProductKey,
  type BillingPriceLicensed,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

// V2 hook — reads the RESOURCE_CREDIT subscription item and available pack prices
// from resourceCreditProducts. Counterpart of useCurrentMetered for V2 workspaces.
export const useCurrentResourceCredit = () => {
  const { currentPlan } = useCurrentPlan();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const getResourceCreditPricesByInterval = (
    interval?: SubscriptionInterval | null,
  ): BillingPriceLicensed[] => {
    const prices = currentPlan.resourceCreditProducts
      .flatMap((product) => product.prices ?? [])
      .filter((price): price is BillingPriceLicensed => isDefined(price));

    return interval
      ? prices.filter((p) => p.recurringInterval === interval)
      : prices;
  };

  const items =
    currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems;

  const currentResourceCreditSubscriptionItem = items?.find(
    (item) =>
      item.billingProduct.metadata?.['productKey'] ===
      BillingProductKey.RESOURCE_CREDIT,
  );

  const resourceCreditPrices = getResourceCreditPricesByInterval();

  const currentResourceCreditBillingPrice = resourceCreditPrices.find(
    (price) =>
      price.stripePriceId ===
      currentResourceCreditSubscriptionItem?.stripePriceId,
  );

  return {
    currentResourceCreditSubscriptionItem,
    currentResourceCreditBillingPrice,
    getResourceCreditPricesByInterval,
  };
};
