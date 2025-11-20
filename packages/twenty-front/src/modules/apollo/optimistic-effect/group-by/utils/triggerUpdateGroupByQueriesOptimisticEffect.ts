import { type ApolloCache, type StoreObject } from '@apollo/client';

import { normalizeGroupByDimensionValue } from '@/apollo/optimistic-effect/group-by/utils/normalizeGroupByDimensionValue';
import { processGroupByConnectionWithRecords } from '@/apollo/optimistic-effect/group-by/utils/processGroupByConnectionWithRecords';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { createCacheEdgeWithRecordRef } from '@/object-record/cache/utils/createCacheEdgeWithRecordRef';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type RecordGqlGroupByConnection } from '@/object-record/graphql/types/RecordGqlOperationGroupByResult';
import { type RecordGqlOperationGroupByVariables } from '@/object-record/graphql/types/RecordGqlOperationGroupByVariables';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

type TriggerUpdateGroupByQueriesOptimisticEffectArgs = {
  cache: ApolloCache<unknown>;
  objectMetadataItem: ObjectMetadataItem;
  operation: 'create' | 'update' | 'delete';
  records: RecordGqlNode[];
  shouldMatchRootQueryFilter?: boolean;
};

export const triggerUpdateGroupByQueriesOptimisticEffect = ({
  cache,
  objectMetadataItem,
  operation,
  records,
  shouldMatchRootQueryFilter = false,
}: TriggerUpdateGroupByQueriesOptimisticEffectArgs) => {
  const groupByQueryFieldName = `${objectMetadataItem.namePlural}GroupBy`;

  cache.modify<StoreObject>({
    broadcast: false,
    fields: {
      [groupByQueryFieldName]: (
        cachedGroupByQueryResult,
        { readField, toReference, storeFieldName },
      ) => {
        const cachedGroupByConnections = cachedGroupByQueryResult as
          | RecordGqlGroupByConnection[]
          | undefined;

        if (!Array.isArray(cachedGroupByConnections)) {
          return cachedGroupByQueryResult;
        }

        const { fieldVariables: queryVariables } = parseApolloStoreFieldName<
          CachedObjectRecordQueryVariables & RecordGqlOperationGroupByVariables
        >(storeFieldName);

        const queryFilter = queryVariables?.filter;
        const groupByConfig = queryVariables?.groupBy;

        const updatedGroupByConnections = cachedGroupByConnections.map(
          (groupConnection) => {
            const groupByDimensionValues =
              readField('groupByDimensionValues', groupConnection) || [];

            const cachedEdges =
              readField<RecordGqlRefEdge[]>('edges', groupConnection) || [];

            const cachedTotalCount = readField<number | undefined>(
              'totalCount',
              groupConnection,
            );

            const cachedPageInfo = readField<{
              startCursor?: string;
              endCursor?: string;
              hasNextPage?: boolean;
              hasPreviousPage?: boolean;
            }>('pageInfo', groupConnection);

            const { nextEdges, nextPageInfo, totalCountDelta } =
              processGroupByConnectionWithRecords({
                cachedEdges,
                cachedPageInfo: cachedPageInfo || {},
                records,
                operation,
                queryFilter,
                shouldMatchRootQueryFilter,
                groupByDimensionValues: Array.isArray(groupByDimensionValues)
                  ? groupByDimensionValues
                  : [],
                groupByConfig,
                objectMetadataItem,
                readField,
                toReference,
              });

            if (
              totalCountDelta === 0 &&
              nextEdges.length === cachedEdges.length
            ) {
              return groupConnection;
            }

            return {
              ...groupConnection,
              edges: nextEdges,
              totalCount: isDefined(cachedTotalCount)
                ? cachedTotalCount + totalCountDelta
                : undefined,
              pageInfo: nextPageInfo,
            };
          },
        );

        if (operation === 'create' || operation === 'update') {
          const recordsToAddToNewGroups: Map<
            string,
            {
              dimensionValues: string[];
              edges: RecordGqlRefEdge[];
            }
          > = new Map();

          for (const record of records) {
            const recordMatchesFilter = isRecordMatchingFilter({
              record,
              filter: queryFilter ?? {},
              objectMetadataItem,
            });

            if (
              shouldMatchRootQueryFilter &&
              !recordMatchesFilter &&
              operation === 'create'
            ) {
              continue;
            }

            if (!isDefined(groupByConfig) || groupByConfig.length === 0) {
              continue;
            }

            // TODO: see if we need to handle the case where it's not an array like for aggregate header
            if (!isArray(groupByConfig)) {
              continue;
            }

            const groupByFieldNames = groupByConfig.map(
              (groupByField) => Object.keys(groupByField)[0],
            );

            const recordDimensionValues: string[] = [];

            for (let i = 0; i < groupByFieldNames.length; i++) {
              const fieldName = groupByFieldNames[i];
              let recordValue = record[fieldName];

              if (!isDefined(recordValue)) {
                break;
              }

              const fieldConfig = groupByConfig[i][fieldName];
              const normalizedValue = normalizeGroupByDimensionValue(
                recordValue,
                fieldConfig,
              );
              recordDimensionValues.push(normalizedValue);
            }

            const dimensionKey = recordDimensionValues.join('|');
            const dimensionExists = updatedGroupByConnections.some((conn) => {
              const connDimensionValues =
                readField('groupByDimensionValues', conn) || [];
              return (
                Array.isArray(connDimensionValues) &&
                connDimensionValues.join('|') === dimensionKey
              );
            });

            if (
              !dimensionExists &&
              recordDimensionValues.length === groupByFieldNames.length
            ) {
              const edge = createCacheEdgeWithRecordRef({
                record,
                objectMetadataItem,
                toReference,
              });

              if (isDefined(edge)) {
                if (!recordsToAddToNewGroups.has(dimensionKey)) {
                  recordsToAddToNewGroups.set(dimensionKey, {
                    dimensionValues: recordDimensionValues,
                    edges: [],
                  });
                }

                recordsToAddToNewGroups.get(dimensionKey)!.edges.push(edge);
              }
            }
          }

          for (const [_, groupData] of recordsToAddToNewGroups) {
            if (groupData.edges.length > 0) {
              const newGroupConnection = {
                __typename: `${objectMetadataItem.nameSingular}Connection`,
                edges: groupData.edges,
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: groupData.edges[0].cursor,
                  endCursor: groupData.edges[groupData.edges.length - 1].cursor,
                },
                totalCount: groupData.edges.length,
                groupByDimensionValues: groupData.dimensionValues,
              };

              updatedGroupByConnections.push(newGroupConnection);
            }
          }
        }

        return updatedGroupByConnections;
      },
    },
  });
};
