import { useApolloClient } from '@apollo/client';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useCreateManyRecordsMutation } from '@/object-record/hooks/useCreateManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isDefined } from '~/utils/isDefined';

type useCreateManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  skipPostOptmisticEffect?: boolean;
  shouldMatchRootQueryFilter?: boolean;
};

export const useCreateManyRecords = <
  CreatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
  skipPostOptmisticEffect = false,
  shouldMatchRootQueryFilter,
}: useCreateManyRecordsProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const { createManyRecordsMutation } = useCreateManyRecordsMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const createOneRecordInCache = useCreateOneRecordInCache<ObjectRecord>({
    objectMetadataItem,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const createManyRecords = async (
    recordsToCreate: Partial<CreatedObjectRecord>[],
    upsert?: boolean,
  ) => {
    const sanitizedCreateManyRecordsInput = recordsToCreate.map(
      (recordToCreate) => {
        const idForCreation = recordToCreate?.id ?? (upsert ? undefined : v4());

        return {
          ...sanitizeRecordInput({
            objectMetadataItem,
            recordInput: recordToCreate,
          }),
          id: idForCreation,
        };
      },
    );

    const recordsCreatedInCache: ObjectRecord[] = [];

    for (const recordToCreate of sanitizedCreateManyRecordsInput) {
      if (recordToCreate.id === null) {
        continue;
      }

      const recordCreatedInCache = createOneRecordInCache({
        ...(recordToCreate as { id: string }),
        __typename: getObjectTypename(objectMetadataItem.nameSingular),
      });

      if (isDefined(recordCreatedInCache)) {
        recordsCreatedInCache.push(recordCreatedInCache);
      }
    }

    if (recordsCreatedInCache.length > 0) {
      triggerCreateRecordsOptimisticEffect({
        cache: apolloClient.cache,
        objectMetadataItem,
        recordsToCreate: recordsCreatedInCache,
        objectMetadataItems,
        shouldMatchRootQueryFilter,
      });
    }

    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      objectMetadataItem.namePlural,
    );

    const createdObjects = await apolloClient
      .mutate({
        mutation: createManyRecordsMutation,
        variables: {
          data: sanitizedCreateManyRecordsInput,
          upsert: upsert,
        },
        update: (cache, { data }) => {
          const records = data?.[mutationResponseField];

          if (!records?.length || skipPostOptmisticEffect) return;

          triggerCreateRecordsOptimisticEffect({
            cache,
            objectMetadataItem,
            recordsToCreate: records,
            objectMetadataItems,
            shouldMatchRootQueryFilter,
          });
        },
      })
      .catch((error: Error) => {
        recordsCreatedInCache.forEach((recordToDestroy) => {
          deleteRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            recordToDestroy,
          });
        });

        triggerDestroyRecordsOptimisticEffect({
          cache: apolloClient.cache,
          objectMetadataItem,
          recordsToDestroy: recordsCreatedInCache,
          objectMetadataItems,
        });

        throw error;
      });

    await refetchAggregateQueries();
    return createdObjects.data?.[mutationResponseField] ?? [];
  };

  return { createManyRecords };
};
