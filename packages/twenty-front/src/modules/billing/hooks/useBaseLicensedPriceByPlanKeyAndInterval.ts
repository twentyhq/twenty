import { type SubscriptionInterval } from '~/generated-metadata/graphql';
import { type BillingPlanKey } from '~/generated/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { useBaseProductByPlanKey } from '@/billing/hooks/useBaseProductByPlanKey';

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
      (price) => price.recurringInterval === interval,
      new Error('Base licensed price not found'),
    );
  };

  return { getBaseLicensedPriceByPlanKeyAndInterval };
};
