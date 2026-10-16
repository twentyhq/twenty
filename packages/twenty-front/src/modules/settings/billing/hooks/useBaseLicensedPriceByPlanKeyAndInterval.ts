import {
  type SubscriptionInterval,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';
import { useBaseProductByPlanKey } from '@/settings/billing/hooks/useBaseProductByPlanKey';
import { findSellablePriceForIntervalOrThrow } from '@/settings/billing/utils/findSellablePriceForIntervalOrThrow';

export const useBaseLicensedPriceByPlanKeyAndInterval = () => {
  const { getBaseProductByPlanKey } = useBaseProductByPlanKey();

  const getBaseLicensedPriceByPlanKeyAndInterval = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
  ) => {
    const baseProduct = getBaseProductByPlanKey(planKey);

    // oxlint-disable-next-line lingui/no-unlocalized-strings -- Keep this developer invariant stable for error grouping.
    if (!baseProduct.prices) throw new Error('Product prices is undefined.');

    return findSellablePriceForIntervalOrThrow(baseProduct.prices, interval);
  };

  return { getBaseLicensedPriceByPlanKeyAndInterval };
};
