import { useApolloClient } from '@apollo/client';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useDestroyManyRecordsMutation } from '@/object-record/hooks/useDestroyManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getDestroyManyRecordsMutationResponseField } from '@/object-record/utils/getDestroyManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';

type useDestroyManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type DestroyManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
};

export const useDestroyManyRecords = ({
  objectNameSingular,
}: useDestroyManyRecordProps) => {
  const apiConfig = useRecoilValue(apiConfigState);

  const mutationPageSize =
    apiConfig?.mutationMaximumAffectedRecords ?? DEFAULT_MUTATION_BATCH_SIZE;

  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const { destroyManyRecordsMutation } = useDestroyManyRecordsMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const mutationResponseField = getDestroyManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const destroyManyRecords = async (
    idsToDestroy: string[],
    options?: DestroyManyRecordsOptions,
  ) => {
    const numberOfBatches = Math.ceil(idsToDestroy.length / mutationPageSize);

    const destroyedRecords = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdToDestroy = idsToDestroy.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const originalRecords = batchedIdToDestroy
        .map((recordId) => getRecordFromCache(recordId, apolloClient.cache))
        .filter(isDefined);

      const destroyedRecordsResponse = await apolloClient
        .mutate({
          mutation: destroyManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdToDestroy } },
          },
          optimisticResponse: options?.skipOptimisticEffect
            ? undefined
            : {
                [mutationResponseField]: batchedIdToDestroy.map(
                  (idToDestroy) => ({
                    __typename: capitalize(objectNameSingular),
                    id: idToDestroy,
                  }),
                ),
              },
          update: options?.skipOptimisticEffect
            ? undefined
            : (cache, { data }) => {
                const records = data?.[mutationResponseField];

                if (!records?.length) return;

                const cachedRecords = records
                  .map((record) => getRecordFromCache(record.id, cache))
                  .filter(isDefined);

                triggerDestroyRecordsOptimisticEffect({
                  cache,
                  objectMetadataItem,
                  recordsToDestroy: cachedRecords,
                  objectMetadataItems,
                });
              },
        })
        .catch((error: Error) => {
          if (originalRecords.length > 0) {
            triggerCreateRecordsOptimisticEffect({
              cache: apolloClient.cache,
              objectMetadataItem,
              recordsToCreate: originalRecords,
              objectMetadataItems,
            });
          }
          throw error;
        });

      const destroyedRecordsForThisBatch =
        destroyedRecordsResponse.data?.[mutationResponseField] ?? [];

      destroyedRecords.push(...destroyedRecordsForThisBatch);

      if (isDefined(options?.delayInMsBetweenRequests)) {
        await sleep(options.delayInMsBetweenRequests);
      }
    }

    await refetchAggregateQueries();
    return destroyedRecords;
  };

  return { destroyManyRecords };
};
