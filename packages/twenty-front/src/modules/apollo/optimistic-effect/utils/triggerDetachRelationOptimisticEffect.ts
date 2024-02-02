import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

export const triggerDetachRelationSourceFromRelationTargetOptimisticEffect = ({
  cache,
  relationSourceObjectNameSingular,
  relationSourceRecordIdToDetach,
  relationTargetObjectNameSingular,
  relationTargetFieldName,
  relationTargetRecordId,
}: {
  cache: ApolloCache<unknown>;
  relationSourceObjectNameSingular: string;
  relationSourceRecordIdToDetach: string;
  relationTargetObjectNameSingular: string;
  relationTargetFieldName: string;
  relationTargetRecordId: string;
}) => {
  const relationTargetRecordTypeName = capitalize(
    relationTargetObjectNameSingular,
  );

  const relationTargetRecordCacheId = cache.identify({
    id: relationTargetRecordId,
    __typename: relationTargetRecordTypeName,
  });

  cache.modify<StoreObject>({
    id: relationTargetRecordCacheId,
    fields: {
      [relationTargetFieldName]: (
        relationTargetFieldValue,
        { isReference, readField },
      ) => {
        const isRelationTargetFieldAnObjectRecordConnection =
          isCachedObjectRecordConnection(
            relationSourceObjectNameSingular,
            relationTargetFieldValue,
          );

        if (isRelationTargetFieldAnObjectRecordConnection) {
          const relationTargetFieldEdgesWithoutRelationSourceRecordToDetach =
            relationTargetFieldValue.edges.filter(
              ({ node }) =>
                readField('id', node) !== relationSourceRecordIdToDetach,
            );

          return {
            ...relationTargetFieldValue,
            edges: relationTargetFieldEdgesWithoutRelationSourceRecordToDetach,
          };
        }

        const isRelationTargetFieldASingleObjectRecord = isReference(
          relationTargetFieldValue,
        );

        if (isRelationTargetFieldASingleObjectRecord) {
          return null;
        }

        return relationTargetFieldValue;
      },
    },
  });
};
