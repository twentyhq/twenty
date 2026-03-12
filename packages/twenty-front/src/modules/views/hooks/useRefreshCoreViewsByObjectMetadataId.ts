import { useApplyCoreViewsForObjectMetadataId } from '@/views/hooks/useApplyCoreViewsForObjectMetadataId';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useLazyQuery } from '@apollo/client/react';
import { FindManyCoreViewsDocument } from '~/generated-metadata/graphql';

export const useRefreshCoreViewsByObjectMetadataId = () => {
  const [findManyCoreViewsLazy] = useLazyQuery(FindManyCoreViewsDocument);
  const { applyCoreViewsForObjectMetadataId } =
    useApplyCoreViewsForObjectMetadataId();

  const refreshCoreViewsByObjectMetadataId = useCallback(
    async (objectMetadataId: string) => {
      const result = await findManyCoreViewsLazy({
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
    [findManyCoreViewsLazy, applyCoreViewsForObjectMetadataId],
  );

  return {
    refreshCoreViewsByObjectMetadataId,
  };
};
