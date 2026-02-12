import { type ApolloCache, type StoreObject } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

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
        { isReference, readField },
      ) => {
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
