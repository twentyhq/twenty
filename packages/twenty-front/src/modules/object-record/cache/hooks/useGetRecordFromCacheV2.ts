import { useMemo } from 'react';
import { gql, useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const useGetRecordFromCacheV2 = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const readFragment = useMemo(() => {
    const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

    const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
        },
      )}
    `;

    return cacheReadFragment;
  }, [objectMetadataItem, objectMetadataItems]);

  const apolloClient = useApolloClient();

  return <CachedObjectRecord extends ObjectRecord = ObjectRecord>(
    recordId: string,
  ) => {
    if (isUndefinedOrNull(objectMetadataItem)) {
      return null;
    }

    const cachedRecordId = apolloClient.cache.identify({
      __typename: capitalize(objectMetadataItem.nameSingular),
      id: recordId,
    });

    return apolloClient.cache.readFragment<
      CachedObjectRecord & { __typename: string }
    >({
      id: cachedRecordId,
      fragment: readFragment,
      optimistic: true,
    });
  };
};
