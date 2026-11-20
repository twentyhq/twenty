import { type ApolloCache, type StoreObject } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';

import { buildSortedConnectionEdges } from '@/apollo/optimistic-effect/utils/buildSortedConnectionEdges';
import { type CachedObjectRecordQueryVariables } from '@/apollo/types/CachedObjectRecordQueryVariables';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';
import {
  capitalize,
  computeRelationWithArgumentsResponseKey,
  getEdgeTypename,
  isDefined,
} from 'twenty-shared/utils';
import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

// A full copy cannot be refilled after a removal: only a refetch knows which record comes next
export const triggerUpdateRelationsWithArgumentsOptimisticEffect = ({
  cache,
  sourceObjectMetadataItem,
  sourceRecordId,
  attachedSourceRecord,
  targetObjectMetadataItem,
  fieldNameOnTargetRecord,
  targetRecordId,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  cache: ApolloCache;
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  sourceRecordId: string;
  // null when the source record no longer belongs to the target
  attachedSourceRecord: RecordGqlNode | null;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldNameOnTargetRecord: string;
  targetRecordId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  const sourceRecordTypeName = capitalize(
    sourceObjectMetadataItem.nameSingular,
  );
  const targetRecordTypeName = capitalize(
    targetObjectMetadataItem.nameSingular,
  );

  const updatedSourceRecordIdsByResponseKey = new Map<string, string[]>();

  // Without an id, cache.modify would fall back to the root query and treat root lists as copies of the relation
  if (!isNonEmptyString(targetRecordId)) {
    return;
  }

  cache.modify<StoreObject>({
    id: cache.identify({
      id: targetRecordId,
      __typename: targetRecordTypeName,
    }),
    fields: {
      [fieldNameOnTargetRecord]: (
        targetRecordFieldValue,
        { readField, storeFieldName, toReference },
      ) => {
        if (
          storeFieldName === fieldNameOnTargetRecord ||
          !isObjectRecordConnectionWithRefs(
            sourceObjectMetadataItem.nameSingular,
            targetRecordFieldValue,
          )
        ) {
          return targetRecordFieldValue;
        }

        const { fieldVariables: relationArguments = {} } =
          parseApolloStoreFieldName<CachedObjectRecordQueryVariables>(
            storeFieldName,
          );

        const currentEdges: RecordGqlRefEdge[] = targetRecordFieldValue.edges;
        const isSourceRecordInEdges = currentEdges.some(
          ({ node }) => readField('id', node) === sourceRecordId,
        );
        const sourceRecordReference = toReference({
          id: sourceRecordId,
          __typename: sourceRecordTypeName,
        });

        const shouldSourceRecordBeInEdges =
          isDefined(attachedSourceRecord) &&
          isDefined(sourceRecordReference) &&
          isRecordMatchingFilter({
            record: attachedSourceRecord,
            filter: relationArguments.filter ?? {},
            objectMetadataItem: sourceObjectMetadataItem,
            objectMetadataItems,
          });

        if (!shouldSourceRecordBeInEdges && !isSourceRecordInEdges) {
          return targetRecordFieldValue;
        }

        const edgesWithoutSourceRecord = currentEdges.filter(
          ({ node }) => readField('id', node) !== sourceRecordId,
        );

        // A record that stays in the list is sorted again too, since the update may have moved it
        const sortedEdges = buildSortedConnectionEdges({
          currentEdges: edgesWithoutSourceRecord,
          newEntries:
            shouldSourceRecordBeInEdges && isDefined(sourceRecordReference)
              ? [
                  {
                    edge: {
                      __typename: getEdgeTypename(
                        sourceObjectMetadataItem.nameSingular,
                      ),
                      node: sourceRecordReference,
                      cursor: '',
                    },
                    record: attachedSourceRecord,
                  },
                ]
              : [],
          orderBy: relationArguments.orderBy,
          readField,
        });

        const nextEdges = isDefined(relationArguments.first)
          ? sortedEdges.slice(0, relationArguments.first)
          : sortedEdges;

        updatedSourceRecordIdsByResponseKey.set(
          computeRelationWithArgumentsResponseKey({
            relationFieldName: fieldNameOnTargetRecord,
            filter: relationArguments.filter,
            orderBy: relationArguments.orderBy,
            first: relationArguments.first,
          }),
          nextEdges
            .map(({ node }) => readField<string>('id', node))
            .filter(isDefined),
        );

        return { ...targetRecordFieldValue, edges: nextEdges };
      },
    },
  });

  if (updatedSourceRecordIdsByResponseKey.size === 0) {
    return;
  }

  upsertRecordsInStore({
    partialRecords: [
      {
        id: targetRecordId,
        __typename: targetRecordTypeName,
        ...Object.fromEntries(
          [...updatedSourceRecordIdsByResponseKey].map(
            ([responseKey, sourceRecordIds]) => [
              responseKey,
              sourceRecordIds
                .map((recordId) =>
                  getRecordFromCache({
                    cache,
                    objectMetadataItem: sourceObjectMetadataItem,
                    objectMetadataItems,
                    recordId,
                    objectPermissionsByObjectMetadataId,
                  }),
                )
                .filter(isDefined),
            ],
          ),
        ),
      },
    ],
  });
};
