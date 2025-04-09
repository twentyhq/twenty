import {
  BillingProductKey,
  useGetMeteredProductsUsageQuery,
} from '~/generated/graphql';

export const useGetWorkflowNodeExecutionUsage = () => {
  const { data, loading } = useGetMeteredProductsUsageQuery();

  const workflowUsage = data?.getMeteredProductsUsage.find(
    (productUsage) =>
      productUsage.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
  );

  if (loading === true || !workflowUsage) {
    return {
      usageQuantity: 0,
      freeUsageQuantity: 0,
      includedFreeQuantity: 0,
      paidUsageQuantity: 0,
      unitPriceCents: 0,
      totalCostCents: 0,
    };
  }

  return {
    usageQuantity: workflowUsage.usageQuantity,
    freeUsageQuantity:
      workflowUsage.usageQuantity > workflowUsage.includedFreeQuantity
        ? workflowUsage.includedFreeQuantity
        : workflowUsage.usageQuantity,
    includedFreeQuantity: workflowUsage.includedFreeQuantity,
    paidUsageQuantity:
      workflowUsage.usageQuantity > workflowUsage.includedFreeQuantity
        ? workflowUsage.usageQuantity - workflowUsage.includedFreeQuantity
        : 0,
    unitPriceCents: workflowUsage.unitPriceCents,
    totalCostCents: workflowUsage.totalCostCents,
  };
};
