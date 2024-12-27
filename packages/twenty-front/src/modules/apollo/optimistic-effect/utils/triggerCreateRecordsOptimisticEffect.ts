import { ApolloCache, StoreObject } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';

import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

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
  shouldMatchRootQueryFilter,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  recordsToCreate: RecordGqlNode[];
  objectMetadataItems: ObjectMetadataItem[];
  shouldMatchRootQueryFilter?: boolean;
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
        { DELETE: _DELETE, readField, storeFieldName, toReference },
      ) => {
        const shouldSkip = !isObjectRecordConnectionWithRefs(
          objectMetadataItem.nameSingular,
          rootQueryCachedResponse,
        );

        if (shouldSkip) {
          return rootQueryCachedResponse;
        }

        const { fieldVariables: rootQueryVariables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const rootQueryFilter = rootQueryVariables?.filter;

        const rootQueryCachedObjectRecordConnection = rootQueryCachedResponse;

        const rootQueryCachedRecordEdges = readField<RecordGqlRefEdge[]>(
          'edges',
          rootQueryCachedObjectRecordConnection,
        );

        const rootQueryCachedRecordTotalCount = readField<number | undefined>(
          'totalCount',
          rootQueryCachedObjectRecordConnection,
        );

        const rootQueryCachedPageInfo = readField<{
          startCursor?: string;
          endCursor?: string;
          hasNextPage?: boolean;
          hasPreviousPage?: boolean;
        }>('pageInfo', rootQueryCachedObjectRecordConnection);

        const nextRootQueryCachedRecordEdges = rootQueryCachedRecordEdges
          ? [...rootQueryCachedRecordEdges]
          : [];

        const nextQueryCachedPageInfo = isDefined(rootQueryCachedPageInfo)
          ? { ...rootQueryCachedPageInfo }
          : {};

        const hasAddedRecords = recordsToCreate
          .map((recordToCreate) => {
            if (isNonEmptyString(recordToCreate.id)) {
              if (
                isDefined(rootQueryFilter) &&
                shouldMatchRootQueryFilter === true
              ) {
                const recordToCreateMatchesThisRootQueryFilter =
                  isRecordMatchingFilter({
                    record: recordToCreate,
                    filter: rootQueryFilter,
                    objectMetadataItem,
                  });

                if (!recordToCreateMatchesThisRootQueryFilter) {
                  return false;
                }
              }

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
                const cursor = encodeCursor(recordToCreate);

                const edge = {
                  __typename: getEdgeTypename(objectMetadataItem.nameSingular),
                  node: recordToCreateReference,
                  cursor,
                };

                if (
                  !isDefined(recordToCreate.position) ||
                  recordToCreate.position === 'first'
                ) {
                  nextRootQueryCachedRecordEdges.unshift(edge);
                  nextQueryCachedPageInfo.startCursor = cursor;
                } else if (recordToCreate.position === 'last') {
                  nextRootQueryCachedRecordEdges.push(edge);
                  nextQueryCachedPageInfo.endCursor = cursor;
                } else if (typeof recordToCreate.position === 'number') {
                  let index = Math.round(
                    nextRootQueryCachedRecordEdges.length *
                      recordToCreate.position,
                  );

                  if (recordToCreate.position < 0) {
                    index = Math.max(
                      0,
                      nextRootQueryCachedRecordEdges.length +
                        Math.round(recordToCreate.position),
                    );
                  } else if (recordToCreate.position > 1) {
                    index = nextRootQueryCachedRecordEdges.length;
                  }

                  index = Math.max(
                    0,
                    Math.min(index, nextRootQueryCachedRecordEdges.length),
                  );

                  nextRootQueryCachedRecordEdges.splice(index, 0, edge);

                  if (index === 0) {
                    nextQueryCachedPageInfo.startCursor = cursor;
                  } else if (
                    index ===
                    nextRootQueryCachedRecordEdges.length - 1
                  ) {
                    nextQueryCachedPageInfo.endCursor = cursor;
                  }
                }

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
          totalCount: isDefined(rootQueryCachedRecordTotalCount)
            ? rootQueryCachedRecordTotalCount + 1
            : undefined,
          pageInfo: nextQueryCachedPageInfo,
        };
      },
    },
  });
};
