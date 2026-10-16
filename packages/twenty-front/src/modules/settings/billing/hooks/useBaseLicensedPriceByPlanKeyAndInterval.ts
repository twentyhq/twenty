import {
  type SubscriptionInterval,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';
import { useBaseProductByPlanKey } from '@/settings/billing/hooks/useBaseProductByPlanKey';
import { findSellablePriceForIntervalOrThrow } from '@/settings/billing/utils/findSellablePriceForIntervalOrThrow';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useBaseLicensedPriceByPlanKeyAndInterval = () => {
  const { getBaseProductByPlanKey } = useBaseProductByPlanKey();

  const getBaseLicensedPriceByPlanKeyAndInterval = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
  ) => {
    const baseProduct = getBaseProductByPlanKey(planKey);

    if (!baseProduct.prices)
      throw new Error(doNotTranslate('Product prices is undefined.'));

    return findSellablePriceForIntervalOrThrow(baseProduct.prices, interval);
  };

  return { getBaseLicensedPriceByPlanKeyAndInterval };
};
