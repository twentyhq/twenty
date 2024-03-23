import { useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

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
      if (isUndefinedOrNull(objectMetadataItem)) {
        return null;
      }

      const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

      const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
        },
      )}
    `;

      const cachedRecordId = cache.identify({
        __typename: capitalize(objectMetadataItem.nameSingular),
        id: recordId,
      });

      return cache.readFragment<CachedObjectRecord & { __typename: string }>({
        id: cachedRecordId,
        fragment: cacheReadFragment,
      });
    },
    [objectMetadataItem, objectMetadataItems, apolloClient],
  );
};
