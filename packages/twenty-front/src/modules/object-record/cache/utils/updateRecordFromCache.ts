import { type ApolloCache } from '@apollo/client/cache';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateRecordCacheFragment } from '@/object-record/cache/utils/generateRecordCacheFragment';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import {
  type RecordGqlFields,
  type ObjectPermissions,
} from 'twenty-shared/types';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const updateRecordFromCache = <T extends ObjectRecord>({
  objectMetadataItems,
  objectMetadataItem,
  cache,
  recordGqlFields,
  record,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  cache: ApolloCache;
  recordGqlFields: RecordGqlFields;
  record: T;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const cacheWriteFragment = generateRecordCacheFragment({
    objectMetadataItems,
    objectMetadataItem,
    computeReferences: true,
    recordGqlFields,
    objectPermissionsByObjectMetadataId,
  });

  const cachedRecordId = cache.identify({
    __typename: capitalize(objectMetadataItem.nameSingular),
    id: record.id,
  });

  const recordWithConnection = getRecordNodeFromRecord<T>({
    objectMetadataItems,
    objectMetadataItem,
    record,
  });

  if (!isDefined(recordWithConnection)) {
    return;
  }

  cache.writeFragment<RecordGqlNode>({
    id: cachedRecordId,
    fragment: cacheWriteFragment,
    data: recordWithConnection,
  });
};
