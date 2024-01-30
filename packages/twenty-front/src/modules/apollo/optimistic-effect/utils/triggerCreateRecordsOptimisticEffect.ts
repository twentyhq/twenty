import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectConnection';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';

/*
  TODO: for now new records are added to all cached record lists, no matter what the variables (filters, orderBy, etc.) are.
  We need to refactor how the record creation works in the RecordTable so the created record row is temporarily displayed with a local state,
  then we'll be able to uncomment the code below so the cached lists are updated coherently with the variables.
*/
export const triggerCreateRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  records,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  records: CachedObjectRecord[];
}) => {
  const objectEdgeTypeName = getEdgeTypename({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        cachedConnection,
        {
          INVALIDATE: _INVALIDATE,
          readField,
          storeFieldName: _storeFieldName,
          toReference,
        },
      ) => {
        if (
          !isCachedObjectConnection(
            objectMetadataItem.nameSingular,
            cachedConnection,
          )
        ) {
          return cachedConnection;
        }

        const cachedEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          cachedConnection,
        );
        const nextCachedEdges = cachedEdges ? [...cachedEdges] : [];

        const hasAddedRecords = records
          .map((record) => {
            if (record.id) {
              const nodeReference = toReference(record);

              const recordAlreadyInCache = cachedEdges?.some((cachedEdge) => {
                return nodeReference?.__ref === cachedEdge.node.__ref;
              });

              console.log({
                _storeFieldName,
                recordAlreadyInCache,
                nodeReference,
                cachedEdges,
              });

              if (nodeReference && !recordAlreadyInCache) {
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

        return { ...cachedConnection, edges: nextCachedEdges };
      },
    },
  });
};
