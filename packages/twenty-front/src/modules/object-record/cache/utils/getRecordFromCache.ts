import { ApolloCache, gql } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isEmptyObject } from '@tiptap/core';
import { capitalize } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type GetRecordFromCacheArgs = {
  cache: ApolloCache<object>;
  recordId: string;
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields?: RecordGqlFields;
};
export const getRecordFromCache = <T extends ObjectRecord = ObjectRecord>({
  objectMetadataItem,
  objectMetadataItems,
  cache,
  recordId,
  recordGqlFields,
}: GetRecordFromCacheArgs) => {
  if (isUndefinedOrNull(objectMetadataItem)) {
    return null;
  }

  const appliedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields: appliedRecordGqlFields,
        },
      )}
    `;

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: recordId,
  });

  const record = cache.readFragment<T & { __typename: string }>({
    id: cachedRecordId,
    fragment: cacheReadFragment,
    returnPartialData: true,
  });

  if (isUndefinedOrNull(record) || isEmptyObject(record)) {
    return null;
  }

  return getRecordFromRecordNode<T>({
    recordNode: record,
  });
};
