import { ApolloCache, StoreObject } from '@apollo/client';

import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { isObjectRecordConnectionWithRefs } from '@/object-record/cache/utils/isObjectRecordConnectionWithRefs';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';

export const triggerAttachRelationOptimisticEffect = ({
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
  const sourceRecordTypeName = capitalize(sourceObjectNameSingular);
  const targetRecordTypeName = capitalize(targetObjectNameSingular);

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
          const nextEdges: RecordGqlRefEdge[] = [
            ...targetRecordFieldValue.edges,
            {
              __typename: `${sourceRecordTypeName}Edge`,
              node: sourceRecordReference,
              cursor: '',
            },
          ];

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
};
