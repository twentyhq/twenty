import { useQuery } from '@apollo/client/react';
import { FindManyMarketplaceAppsDocument } from '~/generated-metadata/graphql';

export const useMarketplaceApps = () => {
  const { data, loading, error, refetch } = useQuery(
    FindManyMarketplaceAppsDocument,
    { notifyOnNetworkStatusChange: true },
  );

  return {
    data: data?.findManyMarketplaceApps ?? [],
    isLoading: loading,
    error,
    refetch,
  };
};
