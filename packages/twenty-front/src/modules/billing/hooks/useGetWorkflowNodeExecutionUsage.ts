import {
  BillingProductKey,
  useGetMeteredProductsUsageQuery,
} from '~/generated-metadata/graphql';
import { findOrThrow } from '~/utils/array/findOrThrow';

export const useGetWorkflowNodeExecutionUsage = () => {
  const { data, loading } = useGetMeteredProductsUsageQuery();

  const isGetMeteredProductsUsageQueryLoaded = () => {
    return data?.getMeteredProductsUsage && !loading;
  };

  const getMeteredProductUsage = () => {
    if (!data) {
      throw new Error('getMeteredProductUsage was not loaded');
    }

    return data.getMeteredProductsUsage;
  };

  const getWorkflowNodeExecutionUsage = () => {
    const workflowUsage = findOrThrow(
      getMeteredProductUsage(),
      (productUsage) =>
        productUsage.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );

    return workflowUsage;
  };

  return {
    isGetMeteredProductsUsageQueryLoaded:
      isGetMeteredProductsUsageQueryLoaded(),
    getWorkflowNodeExecutionUsage,
  };
};
