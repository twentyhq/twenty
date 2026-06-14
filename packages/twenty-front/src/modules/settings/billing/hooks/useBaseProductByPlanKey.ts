import {
  BillingProductKey,
  type BillingPlanKey,
} from '~/generated-metadata/graphql';
import { findOrThrow } from 'twenty-shared/utils';
import { usePlanByPlanKey } from '@/settings/billing/hooks/usePlanByPlanKey';

export const useBaseProductByPlanKey = () => {
  const { getPlanByPlanKey } = usePlanByPlanKey();

  const getBaseProductByPlanKey = (planKey: BillingPlanKey) =>
    findOrThrow(
      getPlanByPlanKey(planKey).baseProducts,
      (product) =>
        product.metadata.productKey === BillingProductKey.BASE_PRODUCT,
      new Error('Base product not found'),
    );

  return { getBaseProductByPlanKey };
};
