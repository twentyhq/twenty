import { useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
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
      queryFields?: Record<string, any>,
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
          queryFields,
        },
      )}
    `;

      const cachedRecordId = cache.identify({
        __typename: capitalize(objectMetadataItem.nameSingular),
        id: recordId,
      });

      const record = cache.readFragment<
        CachedObjectRecord & { __typename: string }
      >({
        id: cachedRecordId,
        fragment: cacheReadFragment,
        returnPartialData: true,
      });

      if (isUndefinedOrNull(record)) {
        return null;
      }

      return getRecordFromRecordNode({
        recordNode: record,
      });
    },
    [objectMetadataItem, objectMetadataItems, apolloClient],
  );
};
