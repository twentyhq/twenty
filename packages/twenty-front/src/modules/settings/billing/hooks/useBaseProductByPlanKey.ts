import { type BillingPlanKey } from '~/generated-metadata/graphql';
import { usePlanByPlanKey } from '@/settings/billing/hooks/usePlanByPlanKey';
import { findSellableBaseProductOrThrow } from '@/settings/billing/utils/findSellableBaseProductOrThrow';

export const useBaseProductByPlanKey = () => {
  const { getPlanByPlanKey } = usePlanByPlanKey();

  const getBaseProductByPlanKey = (planKey: BillingPlanKey) =>
    findSellableBaseProductOrThrow(getPlanByPlanKey(planKey).baseProducts);

  return { getBaseProductByPlanKey };
};
