import { type ApolloCache } from '@apollo/client';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateRecordCacheFragment } from '@/object-record/cache/utils/generateRecordCacheFragment';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize, isDefined, isEmptyObject } from 'twenty-shared/utils';

export type GetRecordFromCacheArgs = {
  cache: ApolloCache;
  recordId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
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
  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem,
      depth: 1,
      objectMetadataItems,
    });

  const cacheReadFragment = generateRecordCacheFragment({
    objectMetadataItems,
    objectMetadataItem,
    recordGqlFields: appliedRecordGqlFields,
    objectPermissionsByObjectMetadataId,
  });

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: recordId,
  });

  const record = cache.readFragment<T & { __typename: string }>({
    id: cachedRecordId,
    fragment: cacheReadFragment,
    returnPartialData: true,
  });

  if (!isDefined(record) || isEmptyObject(record)) {
    return null;
  }

  return getRecordFromRecordNode<T>({
    recordNode: record,
  });
};
