import { ApolloCache, StoreObject } from '@apollo/client';

import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isDefined } from '~/utils/isDefined';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

// TODO: add extensive unit tests for this function
// That will also serve as documentation
export const triggerUpdateRecordOptimisticEffectByBatch = ({
  cache,
  objectMetadataItem,
  currentRecords,
  updatedRecords,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  currentRecords: RecordGqlNode[];
  updatedRecords: RecordGqlNode[];
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  for (const [index, currentRecord] of currentRecords.entries()) {
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord: currentRecord,
      updatedSourceRecord: updatedRecords[index],
      objectMetadataItems,
    });
  }

  cache.modify<StoreObject>({
    fields: {
      [objectMetadataItem.namePlural]: (
        rootQueryCachedResponse,
        { readField, storeFieldName, toReference },
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
          readField<RecordGqlRefEdge[]>('edges', rootQueryConnection) ?? [];

        let rootQueryNextEdges = [...rootQueryCurrentEdges];

        const rootQueryFilter = rootQueryVariables?.filter;
        const rootQueryOrderBy = rootQueryVariables?.orderBy;

        for (const updatedRecord of updatedRecords) {
          const updatedRecordMatchesThisRootQueryFilter =
            isRecordMatchingFilter({
              record: updatedRecord,
              filter: rootQueryFilter ?? {},
              objectMetadataItem,
            });

          const updatedRecordFoundInRootQueryEdges = isDefined(
            rootQueryCurrentEdges.find(
              (cachedEdge) =>
                readField('id', cachedEdge.node) === updatedRecord.id,
            ),
          );

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
            rootQueryNextEdges = rootQueryNextEdges.filter(
              (cachedEdge) =>
                readField('id', cachedEdge.node) !== updatedRecord.id,
            );
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

        return {
          ...rootQueryConnection,
          edges: rootQueryNextEdges,
        };
      },
    },
  });
};
