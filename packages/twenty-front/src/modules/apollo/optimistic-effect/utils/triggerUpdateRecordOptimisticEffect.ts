import { ApolloCache, StoreObject } from '@apollo/client';

import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecord } from '@/apollo/types/CachedObjectRecord';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

// TODO: add extensive unit tests for this function
// That will also serve as documentation
export const triggerUpdateRecordOptimisticEffect = ({
  cache,
  objectMetadataItem,
  currentRecord,
  updatedRecord,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  currentRecord: CachedObjectRecord;
  updatedRecord: CachedObjectRecord;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  triggerUpdateRelationsOptimisticEffect({
    cache,
    sourceObjectMetadataItem: objectMetadataItem,
    currentSourceRecord: currentRecord,
    updatedSourceRecord: updatedRecord,
    objectMetadataItems,
  });

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { DELETE, readField, storeFieldName, toReference },
      ) => {
        const shouldSkip = !isObjectRecordConnectionWithRefs(
          objectMetadataItem.nameSingular,
          rootQueryCachedResponse,
        );

        if (shouldSkip) {
          return rootQueryCachedResponse;
        }

        const rootQueryConnection = rootQueryCachedResponse;

        const { fieldVariables: rootQueryVariables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const rootQueryCurrentEdges =
          readField<CachedObjectRecordEdge[]>('edges', rootQueryConnection) ??
          [];

        let rootQueryNextEdges = [...rootQueryCurrentEdges];

        const rootQueryFilter = rootQueryVariables?.filter;
        const rootQueryOrderBy = rootQueryVariables?.orderBy;
        const rootQueryLimit = rootQueryVariables?.first;

        const shouldTryToMatchFilter = isDefined(rootQueryFilter);

        if (shouldTryToMatchFilter) {
          const updatedRecordMatchesThisRootQueryFilter =
            isRecordMatchingFilter({
              record: updatedRecord,
              filter: rootQueryFilter,
              objectMetadataItem,
            });

          const updatedRecordIndexInRootQueryEdges =
            rootQueryCurrentEdges.findIndex(
              (cachedEdge) =>
                readField('id', cachedEdge.node) === updatedRecord.id,
            );

          const updatedRecordFoundInRootQueryEdges =
            updatedRecordIndexInRootQueryEdges > -1;

          const updatedRecordShouldBeAddedToRootQueryEdges =
            updatedRecordMatchesThisRootQueryFilter &&
            !updatedRecordFoundInRootQueryEdges;

          const updatedRecordShouldBeRemovedFromRootQueryEdges =
            !updatedRecordMatchesThisRootQueryFilter &&
            updatedRecordFoundInRootQueryEdges;

          if (updatedRecordShouldBeAddedToRootQueryEdges) {
            const updatedRecordNodeReference = toReference(updatedRecord);

            if (isDefined(updatedRecordNodeReference)) {
              rootQueryNextEdges.push({
                __typename: getEdgeTypename(objectMetadataItem.nameSingular),
                node: updatedRecordNodeReference,
                cursor: '',
              });
            }
          }

          if (updatedRecordShouldBeRemovedFromRootQueryEdges) {
            rootQueryNextEdges.splice(updatedRecordIndexInRootQueryEdges, 1);
          }
        }

        const rootQueryNextEdgesShouldBeSorted = isDefined(rootQueryOrderBy);

        if (
          rootQueryNextEdgesShouldBeSorted &&
          Object.getOwnPropertyNames(rootQueryOrderBy).length > 0
        ) {
          rootQueryNextEdges = sortCachedObjectEdges({
            edges: rootQueryNextEdges,
            orderBy: rootQueryOrderBy,
            readCacheField: readField,
          });
        }

        const shouldLimitNextRootQueryEdges = isDefined(rootQueryLimit);

        // TODO: not sure that we should trigger a DELETE here, as it will trigger a network request
        // Is it the responsibility of this optimistic effect function to delete a root query that will trigger a network request ?
        // Shouldn't we let the response from the network overwrite the cache and keep this util purely about cache updates ?
        //
        // Shoud we even apply the limit at all since with pagination we cannot really do optimistic rendering and should
        // wait for the network response to update the cache
        //
        // Maybe we could apply a merging function instead and exclude limit from the caching field arguments ?
        // Also we have a problem that is not yet present with this but may arise if we start
        //   to use limit arguments, as for now we rely on the hard coded limit of 60 in pg_graphql.
        // This is as if we had a { limit: 60 } argument in every query but we don't.
        //   so Apollo correctly merges the return of fetchMore for now, because of this,
        //   but wouldn't do it well like Thomas had the problem with mail threads
        //   because he applied a limit of 2 and Apollo created one root query in the cache for each.
        // In Thomas' case we should implement this because he use a hack to overwrite the first request with the return of the other.
        // See: https://www.apollographql.com/docs/react/pagination/cursor-based/#relay-style-cursor-pagination
        // See: https://www.apollographql.com/docs/react/pagination/core-api/#merging-queries
        if (shouldLimitNextRootQueryEdges) {
          // If previous edges length was exactly at the required limit,
          // but after update next edges length is under the limit,
          // we cannot for sure know if re-fetching the query
          // would return more edges, so we cannot optimistically deduce
          // the query's result.
          // In this case, invalidate the cache entry so it can be re-fetched.
          const rootQueryCurrentCachedRecordEdgesLengthIsAtLimit =
            rootQueryCurrentEdges.length === rootQueryLimit;

          // If next edges length is under limit, then we can wait for the network response and merge the result
          //   then in the merge function we could implement this mechanism to limit the number of edges in the cache
          const rootQueryNextCachedRecordEdgesLengthIsUnderLimit =
            rootQueryNextEdges.length < rootQueryLimit;

          const shouldDeleteRootQuerySoItCanBeRefetched =
            rootQueryCurrentCachedRecordEdgesLengthIsAtLimit &&
            rootQueryNextCachedRecordEdgesLengthIsUnderLimit;

          if (shouldDeleteRootQuerySoItCanBeRefetched) {
            return DELETE;
          }

          const rootQueryNextCachedRecordEdgesLengthIsAboveRootQueryLimit =
            rootQueryNextEdges.length > rootQueryLimit;

          if (rootQueryNextCachedRecordEdgesLengthIsAboveRootQueryLimit) {
            rootQueryNextEdges.splice(rootQueryLimit);
          }
        }

        return {
          ...rootQueryConnection,
          edges: rootQueryNextEdges,
        };
      },
    },
  });
};
