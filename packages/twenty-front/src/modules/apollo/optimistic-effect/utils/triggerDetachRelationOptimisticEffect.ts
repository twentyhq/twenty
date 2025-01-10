import { ApolloCache, StoreObject } from '@apollo/client';

import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { capitalize } from 'twenty-shared';

export const triggerDetachRelationOptimisticEffect = ({
  cache,
  sourceObjectNameSingular,
  sourceRecordId,
  targetObjectNameSingular,
  fieldNameOnTargetRecord,
  targetRecordId,
}: {
  cache: ApolloCache<unknown>;
  sourceObjectNameSingular: string;
  sourceRecordId: string;
  targetObjectNameSingular: string;
  fieldNameOnTargetRecord: string;
  targetRecordId: string;
}) => {
  const targetRecordTypeName = capitalize(targetObjectNameSingular);

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
};
