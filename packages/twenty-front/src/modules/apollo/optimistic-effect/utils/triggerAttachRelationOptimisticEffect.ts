import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { capitalize } from '~/utils/string/capitalize';

export const triggerAttachRelationOptimisticEffect = ({
  cache,
  objectNameSingular,
  recordId,
  relationObjectMetadataNameSingular,
  relationFieldName,
  relationRecordId,
}: {
  cache: ApolloCache<unknown>;
  objectNameSingular: string;
  recordId: string;
  relationObjectMetadataNameSingular: string;
  relationFieldName: string;
  relationRecordId: string;
}) => {
  const recordTypeName = capitalize(objectNameSingular);
  const relationRecordTypeName = capitalize(relationObjectMetadataNameSingular);

  cache.modify<StoreObject>({
    id: cache.identify({
      id: relationRecordId,
      __typename: relationRecordTypeName,
    }),
    fields: {
      [relationFieldName]: (cachedFieldValue, { toReference }) => {
        const nodeReference = toReference({
          id: recordId,
          __typename: recordTypeName,
        });

        if (!nodeReference) return cachedFieldValue;

        if (
          isCachedObjectRecordConnection(objectNameSingular, cachedFieldValue)
        ) {
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
};
