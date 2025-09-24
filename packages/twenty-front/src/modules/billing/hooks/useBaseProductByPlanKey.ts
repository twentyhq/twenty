import { BillingProductKey, type BillingPlanKey } from '~/generated/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { usePlanByPlanKey } from '@/billing/hooks/usePlanByPlanKey';

export const useBaseProductByPlanKey = () => {
  const { getPlanByPlanKey } = usePlanByPlanKey();

  const getBaseProductByPlanKey = (planKey: BillingPlanKey) =>
    findOrThrow(
      getPlanByPlanKey(planKey).licensedProducts,
      (product) =>
        product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
      new Error('Base product not found'),
    );

  return { getBaseProductByPlanKey };
};
