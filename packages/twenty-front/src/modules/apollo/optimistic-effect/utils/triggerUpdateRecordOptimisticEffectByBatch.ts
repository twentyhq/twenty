import { type ApolloCache } from '@apollo/client';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export const triggerUpdateRecordOptimisticEffectByBatch = ({
  cache,
  objectMetadataItem,
  currentRecords,
  updatedRecords,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  cache: ApolloCache;
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentRecords: RecordGqlNode[];
  updatedRecords: RecordGqlNode[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  for (const [index, currentRecord] of currentRecords.entries()) {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: currentRecord,
      updatedSourceRecord: updatedRecords[index],
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });
  }

  triggerUpdateRootQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    objectMetadataItems,
    updatedRecords,
  });
};
