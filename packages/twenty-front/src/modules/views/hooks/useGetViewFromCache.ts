import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useGetViewFromCache = () => {
  const client = useApolloClient();
  const cache = client.cache;

  const { getRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const getViewFromCache = useCallback(
    async (viewId: string) => {
      // Todo Fix typing once we have figured out record connections
      const viewWithConnections = getRecordFromCache<any>(viewId, cache);

      if (isUndefinedOrNull(viewWithConnections)) {
        return;
      }

      const view = {
        ...viewWithConnections,
        viewFilters: viewWithConnections.viewFilters?.edges.map(
          (edge: ObjectRecordEdge) => edge.node,
        ),
        viewSorts: viewWithConnections.viewSorts?.edges.map(
          (edge: ObjectRecordEdge) => edge.node,
        ),
        viewFields: viewWithConnections.viewFields?.edges.map(
          (edge: ObjectRecordEdge) => edge.node,
        ),
      } as GraphQLView;

      return view;
    },
    [cache, getRecordFromCache],
  );

  return {
    getViewFromCache,
  };
};
