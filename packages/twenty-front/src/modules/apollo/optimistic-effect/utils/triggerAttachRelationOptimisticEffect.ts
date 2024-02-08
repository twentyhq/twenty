import { ApolloCache, StoreObject } from '@apollo/client';

import { isCachedObjectRecordConnection } from '@/apollo/optimistic-effect/utils/isCachedObjectRecordConnection';
import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const triggerAttachRelationOptimisticEffect = ({
  cache,
  relationSourceObjectNameSingular,
  relationSourceRecordIdToAttach,
  relationTargetObjectNameSingular,
  relationTargetFieldName,
  relationTargetRecordId,
}: {
  cache: ApolloCache<unknown>;
  relationSourceObjectNameSingular: string;
  relationSourceRecordIdToAttach: string;
  relationTargetObjectNameSingular: string;
  relationTargetFieldName: string;
  relationTargetRecordId: string;
}) => {
  const relationSourceRecordTypeName = capitalize(
    relationSourceObjectNameSingular,
  );
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
        relationTargetFieldValuePointingToSource,
        { toReference },
      ) => {
        const isRelationTargetFieldPointingToSourceAnObjectRecordConnection =
          isCachedObjectRecordConnection(
            relationSourceObjectNameSingular,
            relationTargetFieldValuePointingToSource,
          );

        const relationSourceRecordReference = toReference({
          id: relationSourceRecordIdToAttach,
          __typename: relationSourceRecordTypeName,
        });

        if (!isDefined(relationSourceRecordReference)) {
          return relationTargetFieldValuePointingToSource;
        }

        if (isRelationTargetFieldPointingToSourceAnObjectRecordConnection) {
          const relationTargetFieldEdgesPointingToSourceWithRelationSourceRecordToAttach: CachedObjectRecordEdge[] =
            [
              ...relationTargetFieldValuePointingToSource.edges,
              {
                __typename: `${relationSourceRecordTypeName}Edge`,
                node: relationSourceRecordReference,
                cursor: '',
              },
            ];

          return {
            ...relationTargetFieldValuePointingToSource,
            edges:
              relationTargetFieldEdgesPointingToSourceWithRelationSourceRecordToAttach,
          };
        }

        // To one object => attach next relation record
        return relationSourceRecordReference;
      },
    },
  });
};
