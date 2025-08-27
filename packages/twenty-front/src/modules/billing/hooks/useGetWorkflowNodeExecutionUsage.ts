import {
  BillingProductKey,
  useGetMeteredProductsUsageQuery,
} from '~/generated-metadata/graphql';

export const useGetWorkflowNodeExecutionUsage = () => {
  const { data, loading } = useGetMeteredProductsUsageQuery();

  const workflowUsage = data?.getMeteredProductsUsage.find(
    (productUsage) =>
      productUsage.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
  );

  if (loading === true || !workflowUsage) {
    return {
      usedCredits: 0,
      grantedCredits: Infinity,
      unitPriceCents: 0,
    };
  }

  return {
    usedCredits: workflowUsage.usedCredits,
    grantedCredits: workflowUsage.grantedCredits,
    unitPriceCents: workflowUsage.unitPriceCents,
  };
};
