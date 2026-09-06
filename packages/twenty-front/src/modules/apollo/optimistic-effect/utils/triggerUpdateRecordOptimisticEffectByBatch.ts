import { type ApolloCache } from '@apollo/client';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';

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
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  const recordUpdates = currentRecords.map((currentRecord, index) => ({
    currentRecord,
    updatedRecord: updatedRecords[index],
  }));

  for (const { currentRecord, updatedRecord } of recordUpdates) {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: currentRecord,
      updatedSourceRecord: updatedRecord,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });
  }

  triggerUpdateRootQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    objectMetadataItems,
    recordUpdates,
  });
};
