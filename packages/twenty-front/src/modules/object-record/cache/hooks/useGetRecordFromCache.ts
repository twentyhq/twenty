import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useGetRecordFromCache = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

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
