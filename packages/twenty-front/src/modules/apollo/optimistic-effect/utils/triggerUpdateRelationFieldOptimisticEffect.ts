import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectConnection';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export type TriggerUpdateRelationFieldOptimisticEffectParams = {
  cache: ApolloCache<unknown>;
  objectNameSingular: string;
  record: ObjectRecord;
  relationObjectMetadataNameSingular: string;
  relationFieldName: string;
  previousRelationRecord: ObjectRecord | null;
  nextRelationRecord: ObjectRecord | null;
};

export const triggerUpdateRelationFieldOptimisticEffect = ({
  cache,
  objectNameSingular,
  record,
  relationObjectMetadataNameSingular,
  relationFieldName,
  previousRelationRecord,
  nextRelationRecord,
}: TriggerUpdateRelationFieldOptimisticEffectParams) => {
  const recordTypeName = capitalize(objectNameSingular);
  const relationRecordTypeName = capitalize(relationObjectMetadataNameSingular);

  if (previousRelationRecord) {
    cache.modify<StoreObject>({
      id: cache.identify({
        ...previousRelationRecord,
        __typename: relationRecordTypeName,
      }),
      fields: {
        [relationFieldName]: (cachedFieldValue, { isReference, readField }) => {
          // To many objects => remove record from previous relation field list
          if (isCachedObjectConnection(objectNameSingular, cachedFieldValue)) {
            const nextEdges = cachedFieldValue.edges.filter(
              ({ node }) => readField('id', node) !== record.id,
            );
            return { ...cachedFieldValue, edges: nextEdges };
          }

          // To one object => detach previous relation record
          if (isReference(cachedFieldValue)) {
            return null;
          }
        },
      },
    });
  }

  if (nextRelationRecord) {
    cache.modify<StoreObject>({
      id: cache.identify({
        ...nextRelationRecord,
        __typename: relationRecordTypeName,
      }),
      fields: {
        [relationFieldName]: (cachedFieldValue, { toReference }) => {
          const nodeReference = toReference(record);

          if (!nodeReference) return cachedFieldValue;

          if (isCachedObjectConnection(objectNameSingular, cachedFieldValue)) {
            // To many objects => add record to next relation field list
            const nextEdges: CachedObjectRecordEdge[] = [
              ...cachedFieldValue.edges,
              {
                __typename: `${recordTypeName}Edge`,
                node: nodeReference,
                cursor: '',
              },
            ];
            return { ...cachedFieldValue, edges: nextEdges };
          }

          // To one object => attach next relation record
          return nodeReference;
        },
      },
    });
  }
};
