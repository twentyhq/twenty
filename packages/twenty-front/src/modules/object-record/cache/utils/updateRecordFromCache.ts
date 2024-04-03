import { ApolloCache } from '@apollo/client/cache';
import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { capitalize } from '~/utils/string/capitalize';

export const updateRecordFromCache = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  cache,
  record,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<object>;
  record: T;
}) => {
  if (isUndefinedOrNull(objectMetadataItem)) {
    return null;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const cacheWriteFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          computeReferences: true,
        },
      )}
    `;

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: record.id,
  });

  const recordWithConnection = getRecordNodeFromRecord<T>({
    objectMetadataItems,
    objectMetadataItem,
    record,
    depth: 1,
  });

  if (isUndefinedOrNull(recordWithConnection)) {
    return;
  }

  cache.writeFragment<T & { __typename: string }>({
    id: cachedRecordId,
    fragment: cacheWriteFragment,
    data: recordWithConnection,
  });
};
