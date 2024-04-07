import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { View } from '@/views/types/View';

export const useGetViewFromCache = () => {
  const client = useApolloClient();
  const cache = client.cache;

  const { getRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const getViewFromCache = useCallback(
    async (viewId: string) => {
      return getRecordFromCache<View>(viewId, cache);
    },
    [cache, getRecordFromCache],
  );

  return {
    getViewFromCache,
  };
};
