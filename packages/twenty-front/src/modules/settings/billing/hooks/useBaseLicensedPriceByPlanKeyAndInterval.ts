import {
  type SubscriptionInterval,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { useBaseProductByPlanKey } from '@/settings/billing/hooks/useBaseProductByPlanKey';
import { isSellableBillingPrice } from '@/settings/billing/utils/isSellableBillingPrice';

export const useBaseLicensedPriceByPlanKeyAndInterval = () => {
  const { getBaseProductByPlanKey } = useBaseProductByPlanKey();

  const getBaseLicensedPriceByPlanKeyAndInterval = (
    planKey: BillingPlanKey,
    interval: SubscriptionInterval,
  ) => {
    const baseProduct = getBaseProductByPlanKey(planKey);

    if (!baseProduct.prices) throw new Error('Product prices is undefined.');

    return findOrThrow(
      baseProduct.prices,
      (price) =>
        price.recurringInterval === interval && isSellableBillingPrice(price),
      new Error('Base licensed price not found'),
    );
  };

  return { getBaseLicensedPriceByPlanKeyAndInterval };
};
