import { useApplyCoreViewsForObjectMetadataId } from '@/views/hooks/useApplyCoreViewsForObjectMetadataId';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import { FindManyCoreViewsDocument } from '~/generated-metadata/graphql';

export const useRefreshCoreViewsByObjectMetadataId = () => {
  const client = useApolloClient();
  const { applyCoreViewsForObjectMetadataId } =
    useApplyCoreViewsForObjectMetadataId();

  const refreshCoreViewsByObjectMetadataId = useCallback(
    async (objectMetadataId: string) => {
      const result = await client.query({
        query: FindManyCoreViewsDocument,
        variables: {
          objectMetadataId,
        },
        fetchPolicy: 'network-only',
      });

      if (!isDefined(result.data?.getCoreViews)) {
        return;
      }

      applyCoreViewsForObjectMetadataId(
        objectMetadataId,
        result.data.getCoreViews,
      );
    },
    [client, applyCoreViewsForObjectMetadataId],
  );

  return {
    refreshCoreViewsByObjectMetadataId,
  };
};
