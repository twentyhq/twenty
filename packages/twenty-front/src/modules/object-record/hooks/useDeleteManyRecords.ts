import { useApolloClient } from '@apollo/client';

import { triggerDeleteRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDeleteRecordsOptimisticEffect';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/utils/getDeleteManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';
import { capitalize } from '~/utils/string/capitalize';

type useDeleteOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type DeleteManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
};

export const useDeleteManyRecords = ({
  objectNameSingular,
}: useDeleteOneRecordProps) => {
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

  const { deleteManyRecordsMutation } = useDeleteManyRecordsMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecords = async (
    idsToDelete: string[],
    options?: DeleteManyRecordsOptions,
  ) => {
    const numberOfBatches = Math.ceil(idsToDelete.length / mutationPageSize);

    const deletedRecords = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchIds = idsToDelete.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const deletedRecordsResponse = await apolloClient.mutate({
        mutation: deleteManyRecordsMutation,
        variables: {
          filter: { id: { in: batchIds } },
        },
        optimisticResponse: options?.skipOptimisticEffect
          ? undefined
          : {
              [mutationResponseField]: batchIds.map((idToDelete) => ({
                __typename: capitalize(objectNameSingular),
                id: idToDelete,
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

      const deletedRecordsForThisBatch =
        deletedRecordsResponse.data?.[mutationResponseField] ?? [];

      deletedRecords.push(...deletedRecordsForThisBatch);

      if (isDefined(options?.delayInMsBetweenRequests)) {
        await sleep(options.delayInMsBetweenRequests);
      }
    }

    return deletedRecords;
  };

  return { deleteManyRecords };
};
