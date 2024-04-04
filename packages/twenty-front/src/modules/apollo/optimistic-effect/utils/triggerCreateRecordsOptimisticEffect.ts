import { ApolloCache, StoreObject } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';

/*
  TODO: for now new records are added to all cached record lists, no matter what the variables (filters, orderBy, etc.) are.
  We need to refactor how the record creation works in the RecordTable so the created record row is temporarily displayed with a local state,
  then we'll be able to uncomment the code below so the cached lists are updated coherently with the variables.
*/
export const triggerCreateRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  recordsToCreate,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  recordsToCreate: CachedObjectRecord[];
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  recordsToCreate.forEach((record) =>
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: null,
      updatedSourceRecord: record,
      objectMetadataItems,
    }),
  );

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        {
          DELETE: _DELETE,
          readField,
          storeFieldName: _storeFieldName,
          toReference,
        },
      ) => {
        const shouldSkip = !isObjectRecordConnectionWithRefs(
          objectMetadataItem.nameSingular,
          rootQueryCachedResponse,
        );

        if (shouldSkip) {
          return rootQueryCachedResponse;
        }

        const rootQueryCachedObjectRecordConnection = rootQueryCachedResponse;

        const rootQueryCachedRecordEdges = readField<CachedObjectRecordEdge[]>(
          'edges',
          rootQueryCachedObjectRecordConnection,
        );

        const rootQueryCachedRecordTotalCount =
          readField<number>(
            'totalCount',
            rootQueryCachedObjectRecordConnection,
          ) || 0;

        const nextRootQueryCachedRecordEdges = rootQueryCachedRecordEdges
          ? [...rootQueryCachedRecordEdges]
          : [];

        const hasAddedRecords = recordsToCreate
          .map((recordToCreate) => {
            if (isNonEmptyString(recordToCreate.id)) {
              const recordToCreateReference = toReference(recordToCreate);

              if (!recordToCreateReference) {
                throw new Error(
                  `Failed to create reference for record with id: ${recordToCreate.id}`,
                );
              }

              const recordAlreadyInCache = rootQueryCachedRecordEdges?.some(
                (cachedEdge) => {
                  return (
                    cache.identify(recordToCreateReference) ===
                    cache.identify(cachedEdge.node)
                  );
                },
              );

              if (recordToCreateReference && !recordAlreadyInCache) {
                nextRootQueryCachedRecordEdges.unshift({
                  __typename: getEdgeTypename(objectMetadataItem.nameSingular),
                  node: recordToCreateReference,
                  cursor: '',
                });

                return true;
              }
            }

            return false;
          })
          .some((hasAddedRecord) => hasAddedRecord);

        if (!hasAddedRecords) {
          return rootQueryCachedObjectRecordConnection;
        }

        return {
          ...rootQueryCachedObjectRecordConnection,
          edges: nextRootQueryCachedRecordEdges,
          totalCount: rootQueryCachedRecordTotalCount + 1,
        };
      },
    },
  });
};
