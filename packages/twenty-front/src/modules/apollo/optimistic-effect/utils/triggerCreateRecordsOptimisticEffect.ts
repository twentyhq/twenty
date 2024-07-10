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

        const nextRootQueryCachedRecordEdges = rootQueryCachedRecordEdges
          ? [...rootQueryCachedRecordEdges]
          : [];

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
          totalCount: isDefined(rootQueryCachedRecordTotalCount)
            ? rootQueryCachedRecordTotalCount + 1
            : undefined,
        };
      },
    },
  });
};
