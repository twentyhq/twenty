import { ApolloCache } from '@apollo/client/cache';
import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const updateRecordFromCache = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  cache,
  recordGqlFields = undefined,
  record,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  cache: ApolloCache<object>;
  recordGqlFields?: Record<string, any>;
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
          recordGqlFields,
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
  });

  if (isUndefinedOrNull(recordWithConnection)) {
    return;
  }

  cache.writeFragment<RecordGqlNode>({
    id: cachedRecordId,
    fragment: cacheWriteFragment,
    data: recordWithConnection,
  });
};
