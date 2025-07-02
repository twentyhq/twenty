import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import {
  BillingProductKey,
  SubscriptionStatus,
  useGetMeteredProductsUsageQuery,
} from '~/generated-metadata/graphql';

export const useGetWorkflowNodeExecutionUsage = () => {
  const subscriptionStatus = useSubscriptionStatus();

  const { data, loading } = useGetMeteredProductsUsageQuery();

  const workflowUsage = data?.getMeteredProductsUsage.find(
    (productUsage) =>
      productUsage.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
  );

  if (loading === true || !workflowUsage) {
    return {
      usageQuantity: 0,
      freeUsageQuantity: 0,
      includedFreeQuantity: 10000,
      paidUsageQuantity: 0,
      unitPriceCents: 0,
      totalCostCents: 0,
    };
  }

  const includedFreeQuantity =
    subscriptionStatus === SubscriptionStatus.Trialing
      ? workflowUsage.freeTrialQuantity
      : workflowUsage.freeTierQuantity;

  return {
    usageQuantity: workflowUsage.usageQuantity,
    freeUsageQuantity:
      workflowUsage.usageQuantity > includedFreeQuantity
        ? includedFreeQuantity
        : workflowUsage.usageQuantity,
    includedFreeQuantity,
    paidUsageQuantity:
      workflowUsage.usageQuantity > includedFreeQuantity
        ? workflowUsage.usageQuantity - includedFreeQuantity
        : 0,
    unitPriceCents: workflowUsage.unitPriceCents,
    totalCostCents: workflowUsage.totalCostCents,
  };
};
