import { useApolloClient } from '@apollo/client';

import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useRestoreManyRecordsMutation } from '@/object-record/hooks/useRestoreManyRecordsMutation';
import { getRestoreManyRecordsMutationResponseField } from '@/object-record/utils/getRestoreManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';
import { capitalize } from '~/utils/string/capitalize';

type useRestoreManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type RestoreManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
};

export const useRestoreManyRecords = ({
  objectNameSingular,
}: useRestoreManyRecordProps) => {
  const apiConfig = useRecoilValue(apiConfigState);

  const mutationPageSize =
    apiConfig?.mutationMaximumAffectedRecords ?? DEFAULT_MUTATION_BATCH_SIZE;

  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { restoreManyRecordsMutation } = useRestoreManyRecordsMutation({
    objectNameSingular,
  });

  const mutationResponseField = getRestoreManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const restoreManyRecords = async (
    idsToRestore: string[],
    options?: RestoreManyRecordsOptions,
  ) => {
    const numberOfBatches = Math.ceil(idsToRestore.length / mutationPageSize);

    const restoredRecords = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchIds = idsToRestore.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      // TODO: fix optimistic effect
      const findOneQueryName = `FindOne${capitalize(objectNameSingular)}`;
      const findManyQueryName = `FindMany${capitalize(
        objectMetadataItem.namePlural,
      )}`;

      const restoredRecordsResponse = await apolloClient.mutate({
        mutation: restoreManyRecordsMutation,
        refetchQueries: [findOneQueryName, findManyQueryName],
        variables: {
          filter: { id: { in: batchIds } },
        },
        optimisticResponse: options?.skipOptimisticEffect
          ? undefined
          : {
              [mutationResponseField]: batchIds.map((idToRestore) => ({
                __typename: capitalize(objectNameSingular),
                id: idToRestore,
                deletedAt: null,
              })),
            },
      });

      const restoredRecordsForThisBatch =
        restoredRecordsResponse.data?.[mutationResponseField] ?? [];

      restoredRecords.push(...restoredRecordsForThisBatch);

      if (isDefined(options?.delayInMsBetweenRequests)) {
        await sleep(options.delayInMsBetweenRequests);
      }
    }

    return restoredRecords;
  };

  return { restoreManyRecords };
};
