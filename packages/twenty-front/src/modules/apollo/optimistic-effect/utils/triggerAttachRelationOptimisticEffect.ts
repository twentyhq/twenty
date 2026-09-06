import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getFieldMetadataFromGqlField } from '@/object-record/cache/utils/getFieldMetadataFromGqlField';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions, RelationType } from 'twenty-shared/types';
import {
  capitalize,
  getConnectionTypename,
  getEdgeTypename,
  isDefined,
} from 'twenty-shared/utils';

export const triggerAttachRelationOptimisticEffect = ({
  cache,
  sourceObjectNameSingular,
  sourceRecord,
  targetObjectMetadataItem,
  fieldNameOnTargetRecord,
  targetRecordId,
  upsertRecordsInStore,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  cache: ApolloCache;
  sourceObjectNameSingular: string;
  sourceRecord: RecordGqlNode;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldNameOnTargetRecord: string;
  targetRecordId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
  const sourceRecordId = sourceRecord.id;
  const sourceRecordTypeName = capitalize(sourceObjectNameSingular);
  const targetRecordTypeName = capitalize(
    targetObjectMetadataItem.nameSingular,
  );

  const targetRecordCacheId = cache.identify({
    id: targetRecordId,
    __typename: targetRecordTypeName,
  });

  cache.modify<StoreObject>({
    id: targetRecordCacheId,
    fields: {
      [fieldNameOnTargetRecord]: (targetRecordFieldValue, { toReference }) => {
        const fieldValueIsObjectRecordConnectionWithRefs =
          isObjectRecordConnectionWithRefs(
            sourceObjectNameSingular,
            targetRecordFieldValue,
          );

        const sourceRecordReference = toReference({
          id: sourceRecordId,
          __typename: sourceRecordTypeName,
        });

        if (!isDefined(sourceRecordReference)) {
          return targetRecordFieldValue;
        }

        if (fieldValueIsObjectRecordConnectionWithRefs) {
          const recordAlreadyExists = targetRecordFieldValue.edges.some(
            (edge: RecordGqlRefEdge) =>
              edge.node.__ref === sourceRecordReference.__ref,
          );

          if (recordAlreadyExists) {
            return targetRecordFieldValue;
          }

          const nextEdges: RecordGqlRefEdge[] = [
            ...targetRecordFieldValue.edges,
            {
              __typename: `${sourceRecordTypeName}Edge`,
              node: sourceRecordReference,
              cursor: '',
            },
          ];

          upsertRecordsInStore({
            partialRecords: [
              getRecordFromRecordNode({
                recordNode: {
                  id: targetRecordId,
                  [fieldNameOnTargetRecord]: {
                    ...targetRecordFieldValue,
                    edges: nextEdges,
                  },
                  __typename: targetRecordTypeName,
                },
              }),
            ],
          });

          return {
            ...targetRecordFieldValue,
            edges: nextEdges,
          };
        } else {
          return sourceRecordReference;
        }
      },
    },
  });

  const newCachedRecord = getRecordFromCache({
    cache,
    objectMetadataItem: targetObjectMetadataItem,
    objectMetadataItems,
    recordId: targetRecordId,
    objectPermissionsByObjectMetadataId,
  });

  if (!isDefined(newCachedRecord)) {
    return;
  }

  upsertRecordsInStore({ partialRecords: [newCachedRecord] });

  const newCachedRecordNode = getRecordNodeFromRecord({
    objectMetadataItems,
    objectMetadataItem: targetObjectMetadataItem,
    record: newCachedRecord,
    computeReferences: false,
  });

  if (!isDefined(newCachedRecordNode)) {
    return;
  }

  triggerUpdateRootQueriesOptimisticEffect({
    cache,
    objectMetadataItem: targetObjectMetadataItem,
    objectMetadataItems,
    updatedRecords: [
      isDefined(newCachedRecordNode[fieldNameOnTargetRecord])
        ? newCachedRecordNode
        : {
            ...newCachedRecordNode,
            [fieldNameOnTargetRecord]: buildRelationValueFromSourceRecord({
              sourceObjectNameSingular,
              sourceRecord,
              targetObjectMetadataItem,
              fieldNameOnTargetRecord,
            }),
          },
    ],
  });
};

// A target fetched without the relation field cannot be modified in the cache,
// but it is still attached to the source record, which is all the target's
// cached lists need to know to place it.
const buildRelationValueFromSourceRecord = ({
  sourceObjectNameSingular,
  sourceRecord,
  targetObjectMetadataItem,
  fieldNameOnTargetRecord,
}: {
  sourceObjectNameSingular: string;
  sourceRecord: RecordGqlNode;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldNameOnTargetRecord: string;
}) => {
  const fieldMetadataItemOnTargetRecord = getFieldMetadataFromGqlField({
    objectMetadataItem: targetObjectMetadataItem,
    gqlField: fieldNameOnTargetRecord,
  });

  const isToManyRelation =
    fieldMetadataItemOnTargetRecord?.relation?.type ===
      RelationType.ONE_TO_MANY ||
    fieldMetadataItemOnTargetRecord?.settings?.relationType ===
      RelationType.ONE_TO_MANY;

  if (!isToManyRelation) {
    return sourceRecord;
  }

  return {
    __typename: getConnectionTypename(sourceObjectNameSingular),
    edges: [
      {
        __typename: getEdgeTypename(sourceObjectNameSingular),
        node: sourceRecord,
        cursor: '',
      },
    ],
  };
};
