import { useQuery } from '@apollo/client/react';
import { FindManyMarketplaceAppsDocument } from '~/generated-metadata/graphql';

export const useMarketplaceApps = ({
  universalIdentifiers,
}: { universalIdentifiers?: string[] } = {}) => {
  const { data, loading, error } = useQuery(FindManyMarketplaceAppsDocument, {
    variables: { universalIdentifiers },
  });

  return {
    data: data?.findManyMarketplaceApps ?? [],
    isLoading: loading,
    error,
  };
};
