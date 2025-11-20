import { type ApolloCache, gql } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize, isEmptyObject } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type GetRecordFromCacheArgs = {
  cache: ApolloCache<unknown>;
  recordId: string;
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'nameSingular' | 'id' | 'readableFields'
  >;
  recordGqlFields?: RecordGqlFields;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};
export const getRecordFromCache = <T extends ObjectRecord = ObjectRecord>({
  objectMetadataItem,
  objectMetadataItems,
  cache,
  recordId,
  recordGqlFields,
  objectPermissionsByObjectMetadataId,
}: GetRecordFromCacheArgs) => {
  if (isUndefinedOrNull(objectMetadataItem)) {
    return null;
  }

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem,
      depth: 1,
      objectMetadataItems,
    });

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields: appliedRecordGqlFields,
          objectPermissionsByObjectMetadataId,
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
