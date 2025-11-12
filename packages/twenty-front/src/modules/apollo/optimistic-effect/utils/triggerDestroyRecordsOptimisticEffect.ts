import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const triggerDestroyRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  recordsToDestroy,
  objectMetadataItems,
  upsertRecordsInStore,
  objectPermissionsByObjectMetadataId,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  recordsToDestroy: RecordGqlNode[];
  objectMetadataItems: ObjectMetadataItem[];
  upsertRecordsInStore: (records: ObjectRecord[]) => void;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { readField },
      ) => {
        const rootQueryCachedResponseIsNotACachedObjectRecordConnection =
          !isObjectRecordConnectionWithRefs(
            objectMetadataItem.nameSingular,
            rootQueryCachedResponse,
          );

        if (rootQueryCachedResponseIsNotACachedObjectRecordConnection) {
          return rootQueryCachedResponse;
        }

        const rootQueryCachedObjectRecordConnection = rootQueryCachedResponse;

        const recordIdsToDestroy = recordsToDestroy.map(({ id }) => id);
        const cachedEdges = readField<RecordGqlRefEdge[]>(
          'edges',
          rootQueryCachedObjectRecordConnection,
        );

        const totalCount = readField<number | undefined>(
          'totalCount',
          rootQueryCachedObjectRecordConnection,
        );

        const nextCachedEdges =
          cachedEdges?.filter((cachedEdge) => {
            const nodeId = readField<string>('id', cachedEdge.node);

            return nodeId && !recordIdsToDestroy.includes(nodeId);
          }) || [];

        if (nextCachedEdges.length === cachedEdges?.length)
          return rootQueryCachedObjectRecordConnection;

        return {
          ...rootQueryCachedObjectRecordConnection,
          edges: nextCachedEdges,
          totalCount: isDefined(totalCount)
            ? totalCount - recordIdsToDestroy.length
            : undefined,
        };
      },
    },
  });

  recordsToDestroy.forEach((recordToDestroy) => {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: recordToDestroy,
      updatedSourceRecord: null,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });

    cache.evict({ id: cache.identify(recordToDestroy) });
  });

  triggerUpdateGroupByQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    operation: 'delete',
    records: recordsToDestroy,
  });
};
