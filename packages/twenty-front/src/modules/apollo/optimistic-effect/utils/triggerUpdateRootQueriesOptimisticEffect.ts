import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';
import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { getEdgeTypename, isDefined } from 'twenty-shared/utils';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

export type RecordUpdate = {
  currentRecord: RecordGqlNode;
  updatedRecord: RecordGqlNode;
};

// Adds each updated record to the cached lists it now matches, removes it from
// the ones it no longer matches, and keeps their counts in step.
export const triggerUpdateRootQueriesOptimisticEffect = ({
  cache,
  objectMetadataItem,
  objectMetadataItems,
  recordUpdates,
}: {
  cache: ApolloCache;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordUpdates: RecordUpdate[];
}) => {
  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { readField, storeFieldName, toReference },
      ) => {
        if (
          !isObjectRecordConnectionWithRefs(
            objectMetadataItem.nameSingular,
            rootQueryCachedResponse,
          )
        ) {
          return rootQueryCachedResponse;
        }

        const rootQueryConnection = rootQueryCachedResponse;

        const { fieldVariables: rootQueryVariables } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const rootQueryFilter = rootQueryVariables?.filter ?? {};
        const rootQueryOrderBy = rootQueryVariables?.orderBy;

        const isMatchingRootQueryFilter = (record: RecordGqlNode) =>
          isRecordMatchingFilter({
            record,
            filter: rootQueryFilter,
            objectMetadataItem,
            objectMetadataItems,
          });

        let rootQueryNextEdges = [
          ...(readField<RecordGqlRefEdge[]>('edges', rootQueryConnection) ??
            []),
        ];
        let totalCountDelta = 0;

        for (const { currentRecord, updatedRecord } of recordUpdates) {
          const currentRecordMatches = isMatchingRootQueryFilter(currentRecord);
          const updatedRecordMatches = isMatchingRootQueryFilter(updatedRecord);

          totalCountDelta +=
            (updatedRecordMatches ? 1 : 0) - (currentRecordMatches ? 1 : 0);

          const updatedRecordIndexInRootQueryEdges =
            rootQueryNextEdges.findIndex(
              (cachedEdge) =>
                readField('id', cachedEdge.node) === updatedRecord.id,
            );
          const updatedRecordFoundInRootQueryEdges =
            updatedRecordIndexInRootQueryEdges > -1;

          if (updatedRecordMatches && !updatedRecordFoundInRootQueryEdges) {
            const updatedRecordNodeReference = toReference(updatedRecord);

            if (isDefined(updatedRecordNodeReference)) {
              rootQueryNextEdges.push({
                __typename: getEdgeTypename(objectMetadataItem.nameSingular),
                node: updatedRecordNodeReference,
                cursor: '',
              });
            }
          }

          if (!updatedRecordMatches && updatedRecordFoundInRootQueryEdges) {
            rootQueryNextEdges.splice(updatedRecordIndexInRootQueryEdges, 1);
          }
        }

        if (Array.isArray(rootQueryOrderBy) && rootQueryOrderBy.length > 0) {
          rootQueryNextEdges = sortCachedObjectEdges({
            edges: rootQueryNextEdges,
            orderBy: rootQueryOrderBy,
            readCacheField: readField,
          });
        }

        const totalCount = readField<number | undefined>(
          'totalCount',
          rootQueryConnection,
        );

        return {
          ...rootQueryConnection,
          edges: rootQueryNextEdges,
          ...(isDefined(totalCount) && {
            totalCount: Math.max(totalCount + totalCountDelta, 0),
          }),
        };
      },
    },
  });

  triggerUpdateGroupByQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    objectMetadataItems,
    operation: 'update',
    records: recordUpdates.map(({ updatedRecord }) => updatedRecord),
    shouldMatchRootQueryFilter: true,
  });
};
