import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';
import { capitalize } from '~/utils/string/capitalize';

export const triggerUpdateRecordOptimisticEffect = ({
  cache,
  objectMetadataItem,
  previousRecord,
  nextRecord,
  getRelationMetadata,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  previousRecord: CachedObjectRecord;
  nextRecord: CachedObjectRecord;
  getRelationMetadata: ReturnType<typeof useGetRelationMetadata>;
}) => {
  const objectEdgeTypeName = `${capitalize(
    objectMetadataItem.nameSingular,
  )}Edge`;

  triggerUpdateRelationsOptimisticEffect({
    cache,
    objectMetadataItem,
    previousRecord,
    nextRecord,
    getRelationMetadata,
  });

  // Optimistically update record lists
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        { DELETE, readField, storeFieldName, toReference },
      ) => {
        if (
          !isCachedObjectRecordConnection(
            objectMetadataItem.nameSingular,
            cachedConnection,
          )
        )
          return cachedConnection;

        const { variables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedConnection,
        );
        let nextCachedEdges = cachedEdges ? [...cachedEdges] : [];

        // Test if the record matches this list's filters
        if (variables?.filter) {
          const matchesFilter = isRecordMatchingFilter({
            record: nextRecord,
            filter: variables.filter,
            objectMetadataItem,
          });
          const recordIndex = nextCachedEdges.findIndex(
            (cachedEdge) => readField('id', cachedEdge.node) === nextRecord.id,
          );

          // If after update, the record matches this list's filters, then add it to the list
          if (matchesFilter && recordIndex === -1) {
            const nodeReference = toReference(nextRecord);
            nodeReference &&
              nextCachedEdges.push({
                __typename: objectEdgeTypeName,
                node: nodeReference,
                cursor: '',
              });
          }

          // If after update, the record does not match this list's filters anymore, then remove it from the list
          if (!matchesFilter && recordIndex > -1) {
            nextCachedEdges.splice(recordIndex, 1);
          }
        }

        // Sort updated list
        if (variables?.orderBy) {
          nextCachedEdges = sortCachedObjectEdges({
            edges: nextCachedEdges,
            orderBy: variables.orderBy,
            readCacheField: readField,
          });
        }

        // Limit the updated list to the required size
        if (isDefined(variables?.first)) {
          // If previous edges length was exactly at the required limit,
          // but after update next edges length is under the limit,
          // we cannot for sure know if re-fetching the query
          // would return more edges, so we cannot optimistically deduce
          // the query's result.
          // In this case, invalidate the cache entry so it can be re-fetched.
          if (
            cachedEdges?.length === variables.first &&
            nextCachedEdges.length < variables.first
          ) {
            return DELETE;
          }

          // If next edges length exceeds the required limit,
          // trim the next edges array to the correct length.
          if (nextCachedEdges.length > variables.first) {
            nextCachedEdges.splice(variables.first);
          }
        }

        return { ...cachedConnection, edges: nextCachedEdges };
      },
    },
  });
};
