import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

/*
  TODO: for now new records are added to all cached record lists, no matter what the variables (filters, orderBy, etc.) are.
  We need to refactor how the record creation works in the RecordTable so the created record row is temporarily displayed with a local state,
  then we'll be able to uncomment the code below so the cached lists are updated coherently with the variables.
*/
export const triggerCreateRecordsOptimisticEffect = ({
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
  const objectEdgeTypeName = `${capitalize(
    objectMetadataItem.nameSingular,
  )}Edge`;

  records.forEach((record) =>
    triggerUpdateRelationsOptimisticEffect({
      cache,
      objectMetadataItem,
      previousRecord: null,
      nextRecord: record,
      getRelationMetadata,
    }),
  );

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        {
          DELETE: _DELETE,
          readField,
          storeFieldName: _storeFieldName,
          toReference,
        },
      ) => {
        if (
          !isCachedObjectRecordConnection(
            objectMetadataItem.nameSingular,
            cachedConnection,
          )
        )
          return cachedConnection;

        /* const { variables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          ); */

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedConnection,
        );
        const nextCachedEdges = cachedEdges ? [...cachedEdges] : [];

        const hasAddedRecords = records
          .map((record) => {
            /* const matchesFilter =
              !variables?.filter ||
              isRecordMatchingFilter({
                record,
                filter: variables.filter,
                objectMetadataItem,
              }); */

            if (/* matchesFilter && */ record.id) {
              const nodeReference = toReference(record);

              if (nodeReference) {
                nextCachedEdges.unshift({
                  __typename: objectEdgeTypeName,
                  node: nodeReference,
                  cursor: '',
                });

                return true;
              }
            }

            return false;
          })
          .some((hasAddedRecord) => hasAddedRecord);

        if (!hasAddedRecords) return cachedConnection;

        /* if (variables?.orderBy) {
          nextCachedEdges = sortCachedObjectEdges({
            edges: nextCachedEdges,
            orderBy: variables.orderBy,
            readCacheField: readField,
          });
        }

        if (isDefined(variables?.first)) {
          if (
            cachedEdges?.length === variables.first &&
            nextCachedEdges.length < variables.first
          ) {
            return DELETE;
          }

          if (nextCachedEdges.length > variables.first) {
            nextCachedEdges.splice(variables.first);
          }
        } */

        return { ...cachedConnection, edges: nextCachedEdges };
      },
    },
  });
};
