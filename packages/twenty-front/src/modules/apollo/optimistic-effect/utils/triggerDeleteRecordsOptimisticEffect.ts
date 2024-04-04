import { ApolloCache, StoreObject } from '@apollo/client';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

export const triggerDeleteRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  recordsToDelete,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  recordsToDelete: CachedObjectRecord[];
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { DELETE, readField, storeFieldName },
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

        const { fieldVariables: rootQueryVariables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const recordIdsToDelete = recordsToDelete.map(({ id }) => id);

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          rootQueryCachedObjectRecordConnection,
        );

        const totalCount =
          readField<number>(
            'totalCount',
            rootQueryCachedObjectRecordConnection,
          ) || 0;

        const nextCachedEdges =
          cachedEdges?.filter((cachedEdge) => {
            const nodeId = readField<string>('id', cachedEdge.node);

            return nodeId && !recordIdsToDelete.includes(nodeId);
          }) || [];

        if (nextCachedEdges.length === cachedEdges?.length)
          return rootQueryCachedObjectRecordConnection;

        // TODO: same as in update, should we trigger DELETE ?
        if (
          isDefined(rootQueryVariables?.first) &&
          cachedEdges?.length === rootQueryVariables.first
        ) {
          return DELETE;
        }

        return {
          ...rootQueryCachedObjectRecordConnection,
          edges: nextCachedEdges,
          totalCount: totalCount - recordIdsToDelete.length,
        };
      },
    },
  });

  recordsToDelete.forEach((recordToDelete) => {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: recordToDelete,
      updatedSourceRecord: null,
      objectMetadataItems,
    });

    cache.evict({ id: cache.identify(recordToDelete) });
  });
};
