import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingProductKey,
  GetMeteredProductsUsageDocument,
} from '~/generated-metadata/graphql';

// V2 hook — same query shape as useGetWorkflowNodeExecutionUsage but finds
// the RESOURCE_CREDIT product instead of WORKFLOW_NODE_EXECUTION.
export const useGetResourceCreditUsage = () => {
  const { data, loading, refetch } = useQuery(GetMeteredProductsUsageDocument);

  const refetchResourceCreditUsage = () => {
    refetch();
  };

  const isGetResourceCreditUsageQueryLoaded = () => {
    return isDefined(data?.getMeteredProductsUsage) && !loading;
  };

  const getResourceCreditUsage = () => {
    if (!data) {
      throw new Error('getResourceCreditUsage was not loaded');
    }

    const usage = data.getMeteredProductsUsage.find(
      (productUsage) =>
        productUsage.productKey === BillingProductKey.RESOURCE_CREDIT,
    );

    if (!isDefined(usage)) {
      throw new Error('RESOURCE_CREDIT usage not found');
    }

    return usage;
  };

  return {
    refetchResourceCreditUsage,
    isGetResourceCreditUsageQueryLoaded: isGetResourceCreditUsageQueryLoaded(),
    getResourceCreditUsage,
  };
};
