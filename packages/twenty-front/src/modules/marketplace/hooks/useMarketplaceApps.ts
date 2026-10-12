import { useQuery } from '@apollo/client/react';
import { FindManyMarketplaceAppsDocument } from '~/generated-metadata/graphql';

export const useMarketplaceApps = () => {
  const { data, loading, error } = useQuery(FindManyMarketplaceAppsDocument);

  return {
    data: data?.findManyMarketplaceApps ?? [],
    isLoading: loading,
    error,
  };
};
