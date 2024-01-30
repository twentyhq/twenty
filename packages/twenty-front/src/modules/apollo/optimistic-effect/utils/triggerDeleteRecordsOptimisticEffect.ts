import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectConnection';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

export const triggerDeleteRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  records,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  records: Pick<CachedObjectRecord, 'id' | '__typename'>[];
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        { DELETE, readField, storeFieldName },
      ) => {
        if (
          !isCachedObjectConnection(
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

  cache.gc();
};
