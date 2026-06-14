import { type ApolloCache, type StoreObject } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { buildSortedConnectionEdges } from '@/apollo/optimistic-effect/utils/buildSortedConnectionEdges';
import { triggerUpdateRelationsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type ObjectPermissions } from 'twenty-shared/types';
import { getEdgeTypename, isDefined } from 'twenty-shared/utils';
import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

/*
  TODO: for now new records are added to all cached record lists, no matter what the variables (filters, orderBy, etc.) are.
  We need to refactor how the record creation works in the RecordTable so the created record row is temporarily displayed with a local state,
  then we'll be able to uncomment the code below so the cached lists are updated coherently with the variables.
*/
type TriggerCreateRecordsOptimisticEffectArgs = {
  cache: ApolloCache;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordsToCreate: RecordGqlNode[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  shouldMatchRootQueryFilter?: boolean;
  checkForRecordInCache?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
};

export const triggerCreateRecordsOptimisticEffect = ({
  cache,
  objectMetadataItem,
  recordsToCreate,
  objectMetadataItems,
  shouldMatchRootQueryFilter,
  checkForRecordInCache = false,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: TriggerCreateRecordsOptimisticEffectArgs) => {
  const getRecordNodeFromCache = (recordId: string): RecordGqlNode | null => {
    const cachedRecord = getRecordFromCache({
      cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId,
      objectPermissionsByObjectMetadataId,
    });
    return getRecordNodeFromRecord({
      objectMetadataItem,
      objectMetadataItems,
      record: cachedRecord,
      computeReferences: false,
    });
  };

  recordsToCreate.forEach((record) => {
    const currentSourceRecord = checkForRecordInCache
      ? getRecordNodeFromCache(record.id)
      : null;
    triggerUpdateRelationsOptimisticEffect({
      cache,
      sourceObjectMetadataItem: objectMetadataItem,
      currentSourceRecord,
      updatedSourceRecord: record,
      objectMetadataItems,
      upsertRecordsInStore,
      objectPermissionsByObjectMetadataId,
    });
  });

  cache.modify<StoreObject>({
    broadcast: false,
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

        const newEntries = recordsToCreate.flatMap<{
          edge: RecordGqlRefEdge;
          record: RecordGqlNode;
        }>((recordToCreate) => {
          if (!isNonEmptyString(recordToCreate.id)) {
            return [];
          }

          if (
            isDefined(rootQueryFilter) &&
            shouldMatchRootQueryFilter === true &&
            !isRecordMatchingFilter({
              record: recordToCreate,
              filter: rootQueryFilter,
              objectMetadataItem,
            })
          ) {
            return [];
          }

          const node = toReference(recordToCreate);

          if (!isDefined(node)) {
            return [];
          }

          const recordAlreadyInCache = rootQueryCachedRecordEdges?.some(
            (cachedEdge) =>
              cache.identify(node) === cache.identify(cachedEdge.node),
          );

          if (recordAlreadyInCache === true) {
            return [];
          }

          return [
            {
              edge: {
                __typename: getEdgeTypename(objectMetadataItem.nameSingular),
                node,
                cursor: encodeCursor(recordToCreate),
              },
              record: recordToCreate,
            },
          ];
        });

        if (newEntries.length === 0) {
          return rootQueryCachedObjectRecordConnection;
        }

        const sortedEdges = buildSortedConnectionEdges({
          currentEdges: rootQueryCachedRecordEdges ?? [],
          newEntries,
          orderBy: rootQueryVariables?.orderBy,
          readField,
        });

        return {
          ...rootQueryCachedObjectRecordConnection,
          edges: sortedEdges,
          totalCount: isDefined(rootQueryCachedRecordTotalCount)
            ? rootQueryCachedRecordTotalCount + newEntries.length
            : undefined,
          pageInfo: {
            ...(rootQueryCachedPageInfo ?? {}),
            startCursor:
              sortedEdges[0]?.cursor ?? rootQueryCachedPageInfo?.startCursor,
            endCursor:
              sortedEdges[sortedEdges.length - 1]?.cursor ??
              rootQueryCachedPageInfo?.endCursor,
          },
        };
      },
    },
  });

  triggerUpdateGroupByQueriesOptimisticEffect({
    cache,
    objectMetadataItem,
    operation: 'create',
    records: recordsToCreate,
    shouldMatchRootQueryFilter,
  });
};
