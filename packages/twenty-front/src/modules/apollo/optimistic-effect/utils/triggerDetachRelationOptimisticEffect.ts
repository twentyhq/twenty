import { type ApolloCache, type StoreObject } from '@apollo/client';

import { triggerUpdateRelationsWithArgumentsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRelationsWithArgumentsOptimisticEffect';
import { triggerUpdateRootQueriesOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRootQueriesOptimisticEffect';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export const triggerDetachRelationOptimisticEffect = ({
  cache,
  sourceObjectNameSingular,
  sourceRecordId,
  targetObjectMetadataItem,
  fieldNameOnTargetRecord,
  targetRecordId,
  objectMetadataItems,
  objectPermissionsByObjectMetadataId,
  upsertRecordsInStore,
}: {
  cache: ApolloCache;
  sourceObjectNameSingular: string;
  sourceRecordId: string;
  targetObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldNameOnTargetRecord: string;
  targetRecordId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
  upsertRecordsInStore: (props: { partialRecords: ObjectRecord[] }) => void;
}) => {
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
      [fieldNameOnTargetRecord]: (
        targetRecordFieldValue,
        { isReference, readField, storeFieldName },
      ) => {
        // Copies with arguments are filtered or limited: triggerUpdateRelationsWithArgumentsOptimisticEffect owns them
        if (storeFieldName !== fieldNameOnTargetRecord) {
          return targetRecordFieldValue;
        }

        const isRecordConnection = isObjectRecordConnectionWithRefs(
          sourceObjectNameSingular,
          targetRecordFieldValue,
        );

        if (isRecordConnection) {
          const nextEdges = targetRecordFieldValue.edges.filter(
            ({ node }) => readField('id', node) !== sourceRecordId,
          );

          return {
            ...targetRecordFieldValue,
            edges: nextEdges,
          };
        }

        const isSingleReference = isReference(targetRecordFieldValue);

        if (isSingleReference) {
          return null;
        }

        return targetRecordFieldValue;
      },
    },
  });

  const sourceObjectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === sourceObjectNameSingular,
  );

  if (isDefined(sourceObjectMetadataItem)) {
    triggerUpdateRelationsWithArgumentsOptimisticEffect({
      cache,
      sourceObjectMetadataItem,
      sourceRecordId,
      attachedSourceRecord: null,
      targetObjectMetadataItem,
      fieldNameOnTargetRecord,
      targetRecordId,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    });
  }

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
    updatedRecords: [newCachedRecordNode],
  });
};
