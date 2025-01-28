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
export const triggerUpdateRecordOptimisticEffect = ({
  cache,
  objectMetadataItem,
  currentRecord,
  updatedRecord,
  objectMetadataItems,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  currentRecord: RecordGqlNode;
  updatedRecord: RecordGqlNode;
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

        const updatedRecordMatchesThisRootQueryFilter = isRecordMatchingFilter({
          record: updatedRecord,
          filter: rootQueryFilter ?? {},
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
