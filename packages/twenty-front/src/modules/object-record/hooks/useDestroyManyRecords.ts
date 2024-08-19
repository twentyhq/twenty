import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useDestroyManyRecordsMutation } from '@/object-record/hooks/useDestroyManyRecordMutation';
import { getDestroyManyRecordsMutationResponseField } from '@/object-record/utils/getDestroyManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';
import { capitalize } from '~/utils/string/capitalize';

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
      const batchIds = idsToDestroy.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const destroyedRecordsResponse = await apolloClient.mutate({
        mutation: destroyManyRecordsMutation,
        variables: {
          filter: { id: { in: batchIds } },
        },
        optimisticResponse: options?.skipOptimisticEffect
          ? undefined
          : {
              [mutationResponseField]: batchIds.map((idToDestroy) => ({
                __typename: capitalize(objectNameSingular),
                id: idToDestroy,
              })),
            },
        update: options?.skipOptimisticEffect
          ? undefined
          : (cache, { data }) => {
              const records = data?.[mutationResponseField];

              if (!records?.length) return;

              const cachedRecords = records
                .map((record) => getRecordFromCache(record.id, cache))
                .filter(isDefined);

              triggerDeleteRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToDelete: cachedRecords,
                objectMetadataItems,
              });
            },
      });

      const destroyedRecordsForThisBatch =
        destroyedRecordsResponse.data?.[mutationResponseField] ?? [];

      destroyedRecords.push(...destroyedRecordsForThisBatch);

      if (isDefined(options?.delayInMsBetweenRequests)) {
        await sleep(options.delayInMsBetweenRequests);
      }
    }

    return destroyedRecords;
  };

  return { destroyManyRecords };
};
