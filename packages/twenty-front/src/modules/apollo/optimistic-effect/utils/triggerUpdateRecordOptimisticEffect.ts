import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';
import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';
// TODO: add extensive unit tests for this function
// That will also serve as documentation
export const triggerUpdateRecordOptimisticEffect = ({
  cache,
  objectMetadataItem,
  currentRecord,
  updatedRecord,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  currentRecord: RecordGqlNode;
  updatedRecord: RecordGqlNode;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  triggerUpdateRelationsOptimisticEffect({
    cache,
    sourceObjectMetadataItem: objectMetadataItem,
    currentSourceRecord: currentRecord,
    updatedSourceRecord: updatedRecord,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
    upsertRecordsInStore,
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

        const currentRecordIndexInRootQueryEdges = isRecordMatchingFilter({
          record: currentRecord,
          filter: rootQueryFilter ?? {},
          objectMetadataItem,
        });

        const totalCount = readField<number | undefined>(
          'totalCount',
          rootQueryConnection,
        );

        const newTotalCount = isDefined(totalCount)
          ? Math.max(
              totalCount +
                (updatedRecordMatchesThisRootQueryFilter ? 1 : 0) +
                (currentRecordIndexInRootQueryEdges ? -1 : 0),
              0,
            )
          : undefined;

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
          totalCount: newTotalCount,
        };
      },
    },
  });

  triggerUpdateGroupByQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    operation: 'update',
    records: [updatedRecord],
    shouldMatchRootQueryFilter: true,
  });
};
