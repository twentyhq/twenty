import { useQuery } from '@apollo/client/react';

import { UsageQuotaDefinitionsDocument } from '~/generated-metadata/graphql';

export const useUsageQuotaDefinitions = () => {
  const { data, loading } = useQuery(UsageQuotaDefinitionsDocument);

  return {
    usageQuotaDefinitions: data?.usageQuotaDefinitions,
    loading,
  };
};
