import { type ApolloCache } from '@apollo/client';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export const triggerUpdateRecordOptimisticEffect = ({
  cache,
  objectMetadataItem,
  currentRecord,
  updatedRecord,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  cache: ApolloCache;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentRecord: RecordGqlNode;
  updatedRecord: RecordGqlNode;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  triggerUpdateRelationsOptimisticEffect({
    cache,
    sourceObjectMetadataItem: objectMetadataItem,
    currentSourceRecord: currentRecord,
    updatedSourceRecord: updatedRecord,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
    upsertRecordsInStore,
  });

  triggerUpdateRootQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    objectMetadataItems,
    updatedRecords: [updatedRecord],
  });
};
