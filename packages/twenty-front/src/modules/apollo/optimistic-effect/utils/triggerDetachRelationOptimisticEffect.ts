import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

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
        const isRelationTargetFieldAnObjectRecordConnection =
          isCachedObjectRecordConnection(
            sourceObjectNameSingular,
            targetRecordFieldValue,
          );

        if (isRelationTargetFieldAnObjectRecordConnection) {
          const relationTargetFieldEdgesWithoutRelationSourceRecordToDetach =
            targetRecordFieldValue.edges.filter(
              ({ node }) => readField('id', node) !== sourceRecordId,
            );

          return {
            ...targetRecordFieldValue,
            edges: relationTargetFieldEdgesWithoutRelationSourceRecordToDetach,
          };
        }

        const isRelationTargetFieldASingleObjectRecord = isReference(
          targetRecordFieldValue,
        );

        if (isRelationTargetFieldASingleObjectRecord) {
          return null;
        }

        return targetRecordFieldValue;
      },
    },
  });
};
