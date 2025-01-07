import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useRestoreManyRecordsMutation } from '@/object-record/hooks/useRestoreManyRecordsMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRestoreManyRecordsMutationResponseField } from '@/object-record/utils/getRestoreManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';

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

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const { restoreManyRecordsMutation } = useRestoreManyRecordsMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

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
      const batchedIdsToRestore = idsToRestore.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToRestore
        .map((idToRestore) =>
          getRecordFromCache(idToRestore, apolloClient.cache),
        )
        .filter(isDefined);

      if (!options?.skipOptimisticEffect) {
        cachedRecords.forEach((cachedRecord) => {
          if (!cachedRecord || !cachedRecord.id) {
            return;
          }

          const cachedRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: cachedRecord,
              objectMetadataItem,
              objectMetadataItems,
              computeReferences: true,
            });

          const computedOptimisticRecord = {
            ...cachedRecord,
            ...{ id: cachedRecord.id, deletedAt: null },
            ...{ __typename: capitalize(objectMetadataItem.nameSingular) },
          };

          const optimisticRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: computedOptimisticRecord,
              objectMetadataItem,
              objectMetadataItems,
              computeReferences: true,
            });

          if (!optimisticRecordWithConnection || !cachedRecordWithConnection) {
            return null;
          }

          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: computedOptimisticRecord,
          });

          triggerUpdateRecordOptimisticEffect({
            cache: apolloClient.cache,
            objectMetadataItem,
            currentRecord: cachedRecordWithConnection,
            updatedRecord: optimisticRecordWithConnection,
            objectMetadataItems,
          });
        });
      }

      const restoredRecordsResponse = await apolloClient
        .mutate({
          mutation: restoreManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToRestore } },
          },
        })
        .catch((error: Error) => {
          cachedRecords.forEach((cachedRecord) => {
            if (!cachedRecord) {
              return;
            }

            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloClient.cache,
              record: cachedRecord,
            });

            const cachedRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: cachedRecord,
                objectMetadataItem,
                objectMetadataItems,
                computeReferences: true,
              });

            const computedOptimisticRecord = {
              ...cachedRecord,
              ...{ id: cachedRecord.id, deletedAt: null },
              ...{ __typename: capitalize(objectMetadataItem.nameSingular) },
            };

            const optimisticRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: computedOptimisticRecord,
                objectMetadataItem,
                objectMetadataItems,
                computeReferences: true,
              });

            if (
              !optimisticRecordWithConnection ||
              !cachedRecordWithConnection
            ) {
              return null;
            }

            triggerUpdateRecordOptimisticEffect({
              cache: apolloClient.cache,
              objectMetadataItem,
              currentRecord: optimisticRecordWithConnection,
              updatedRecord: cachedRecordWithConnection,
              objectMetadataItems,
            });
          });

          throw error;
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
