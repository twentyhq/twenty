import { useQuery } from '@apollo/client/react';
import {
  BillingProductKey,
  GetMeteredProductsUsageDocument,
} from '~/generated-metadata/graphql';
import { findOrThrow } from 'twenty-shared/utils';

export const useGetWorkflowNodeExecutionUsage = () => {
  const { data, loading, refetch } = useQuery(GetMeteredProductsUsageDocument);

  const refetchMeteredProductsUsage = () => {
    refetch();
  };

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
    return findOrThrow(
      getMeteredProductUsage(),
      (productUsage) =>
        productUsage.productKey === BillingProductKey.WORKFLOW_NODE_EXECUTION,
    );
  };

  return {
    refetchMeteredProductsUsage,
    isGetMeteredProductsUsageQueryLoaded:
      isGetMeteredProductsUsageQueryLoaded(),
    getWorkflowNodeExecutionUsage,
  };
};
