import { useQuery } from '@apollo/client/react';

import { UsageQuotasWithConsumptionDocument } from '~/generated-metadata/graphql';

export const useUsageQuotasWithConsumption = () => {
  const { data, loading, error } = useQuery(UsageQuotasWithConsumptionDocument);

  return {
    usageQuotasWithConsumption: data?.usageQuotasWithConsumption ?? [],
    loading,
    error,
  };
};
