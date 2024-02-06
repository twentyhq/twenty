import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

export const triggerDeleteRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  records,
  getRelationMetadata,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  records: CachedObjectRecord[];
  getRelationMetadata: ReturnType<typeof useGetRelationMetadata>;
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        { DELETE, readField, storeFieldName },
      ) => {
        if (
          !isCachedObjectRecordConnection(
            objectMetadataItem.nameSingular,
            cachedConnection,
          )
        ) {
          return cachedConnection;
        }

        const { variables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const recordIds = records.map(({ id }) => id);

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedConnection,
        );
        const nextCachedEdges =
          cachedEdges?.filter((cachedEdge) => {
            const nodeId = readField<string>('id', cachedEdge.node);
            return nodeId && !recordIds.includes(nodeId);
          }) || [];

        if (nextCachedEdges.length === cachedEdges?.length)
          return cachedConnection;

        if (
          isDefined(variables?.first) &&
          cachedEdges?.length === variables.first
        ) {
          return DELETE;
        }

        return { ...cachedConnection, edges: nextCachedEdges };
      },
    },
  });

  records.forEach((record) => {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      objectMetadataItem,
      previousRecord: record,
      nextRecord: null,
      getRelationMetadata,
    });

    cache.evict({ id: cache.identify(record) });
  });
};
