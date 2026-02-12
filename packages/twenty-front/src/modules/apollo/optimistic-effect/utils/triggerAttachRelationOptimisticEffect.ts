import { type ApolloCache, type StoreObject } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const triggerAttachRelationOptimisticEffect = ({
  cache,
  sourceObjectNameSingular,
  sourceRecordId,
  targetObjectMetadataItem,
  fieldNameOnTargetRecord,
  targetRecordId,
  upsertRecordsInStore,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
}: {
  cache: ApolloCache<unknown>;
  sourceObjectNameSingular: string;
  sourceRecordId: string;
  targetObjectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'nameSingular' | 'id' | 'readableFields'
  >;
  fieldNameOnTargetRecord: string;
  targetRecordId: string;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
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
          // To one object => attach next relation record
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
};
