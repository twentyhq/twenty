import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useGetRecordFromCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const apolloClient = useApolloClient();

  return useCallback(
    <CachedObjectRecord extends ObjectRecord = ObjectRecord>(
      recordId: string,
      cache = apolloClient.cache,
    ) => {
      return getRecordFromCache<CachedObjectRecord>({
        cache,
        recordId,
        objectMetadataItems,
        objectMetadataItem,
      });
    },
    [objectMetadataItem, objectMetadataItems, apolloClient],
  );
};
