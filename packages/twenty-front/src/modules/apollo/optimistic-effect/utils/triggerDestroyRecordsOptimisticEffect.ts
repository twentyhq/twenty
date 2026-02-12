import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

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
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { readField, storeFieldName },
      ) => {
        const { fieldVariables: rootQueryVariables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        if (
          !isObjectRecordConnection(
            objectMetadataItem.nameSingular,
            rootQueryCachedResponse,
          )
        ) {
          return rootQueryCachedResponse;
        }

        const totalCount = readField<number | undefined>(
          'totalCount',
          rootQueryCachedResponse,
        );

        const recordsMatchingRootQueryFilter = recordsToDestroy.filter(
          (record) =>
            isRecordMatchingFilter({
              record,
              filter: rootQueryVariables?.filter ?? {},
              objectMetadataItem,
            }),
        );

        const newTotalCount = isDefined(totalCount)
          ? Math.max(totalCount - recordsMatchingRootQueryFilter.length, 0)
          : undefined;

        if (
          !isObjectRecordConnectionWithRefs(
            objectMetadataItem.nameSingular,
            rootQueryCachedResponse,
          )
        ) {
          return {
            ...rootQueryCachedResponse,
            totalCount: newTotalCount,
          };
        }

        const rootQueryCachedObjectRecordConnection = rootQueryCachedResponse;

        const recordIdsToDestroy = recordsToDestroy.map(({ id }) => id);
        const cachedEdges = readField<RecordGqlRefEdge[]>(
          'edges',
          rootQueryCachedObjectRecordConnection,
        );

        const nextCachedEdges =
          cachedEdges?.filter((cachedEdge) => {
            const nodeId = readField<string>('id', cachedEdge.node);

            return nodeId && !recordIdsToDestroy.includes(nodeId);
          }) || [];

        if (nextCachedEdges.length === cachedEdges?.length)
          return {
            ...rootQueryCachedObjectRecordConnection,
            totalCount: newTotalCount,
          };

        return {
          ...rootQueryCachedObjectRecordConnection,
          edges: nextCachedEdges,
          totalCount: newTotalCount,
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
