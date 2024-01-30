import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

export const triggerDetachRelationOptimisticEffect = ({
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
  const relationRecordTypeName = capitalize(relationObjectMetadataNameSingular);

  cache.modify<StoreObject>({
    id: cache.identify({
      id: relationRecordId,
      __typename: relationRecordTypeName,
    }),
    fields: {
      [relationFieldName]: (cachedFieldValue, { isReference, readField }) => {
        // To many objects => remove record from previous relation field list
        if (
          isCachedObjectRecordConnection(objectNameSingular, cachedFieldValue)
        ) {
          const nextEdges = cachedFieldValue.edges.filter(
            ({ node }) => readField('id', node) !== recordId,
          );
          return { ...cachedFieldValue, edges: nextEdges };
        }

        // To one object => detach previous relation record
        if (isReference(cachedFieldValue)) {
          return null;
        }

        return cachedFieldValue;
      },
    },
  });
};
