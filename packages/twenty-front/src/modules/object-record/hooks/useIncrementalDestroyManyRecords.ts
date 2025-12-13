import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useDestroyManyRecordsMutation } from '@/object-record/hooks/useDestroyManyRecordsMutation';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getDestroyManyRecordsMutationResponseField } from '@/object-record/utils/getDestroyManyRecordsMutationResponseField';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

const DEFAULT_DELAY_BETWEEN_MUTATIONS_MS = 50;

type UseIncrementalDestroyManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  objectNameSingular: string;
  pageSize?: number;
  delayInMsBetweenMutations?: number;
  skipOptimisticEffect?: boolean;
};

export const useIncrementalDestroyManyRecords = <T>({
  objectNameSingular,
  filter,
  orderBy,
  pageSize = DEFAULT_QUERY_PAGE_SIZE,
  delayInMsBetweenMutations = DEFAULT_DELAY_BETWEEN_MUTATIONS_MS,
  skipOptimisticEffect = false,
}: UseIncrementalDestroyManyRecordsParams<T>) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const mutationPageSize = pageSize;

  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const getRecordFromCache = useGetRecordFromCache({ objectNameSingular });

  const { destroyManyRecordsMutation } = useDestroyManyRecordsMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const mutationResponseField = getDestroyManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const { incrementalFetchAndMutate, progress, isProcessing, updateProgress } =
    useIncrementalFetchAndMutateRecords<T>({
      objectNameSingular,
      filter,
      orderBy,
      limit: pageSize,
      recordGqlFields: { id: true },
    });

  const destroyManyRecordsBatch = async (
    recordIdsToDestroy: string[],
    abortSignal: AbortSignal,
  ) => {
    const numberOfBatches = Math.ceil(
      recordIdsToDestroy.length / mutationPageSize,
    );

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdsToDestroy = recordIdsToDestroy.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToDestroy
        .map((recordId) => getRecordFromCache(recordId, apolloCoreClient.cache))
        .filter(isDefined);

      await apolloCoreClient
        .mutate<Record<string, ObjectRecord[]>>({
          mutation: destroyManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToDestroy } },
          },
          context: {
            fetchOptions: {
              signal: abortSignal,
            },
          },
          optimisticResponse: skipOptimisticEffect
            ? undefined
            : {
                [mutationResponseField]: batchedIdsToDestroy.map(
                  (idToDestroy) => ({
                    __typename: capitalize(objectNameSingular),
                    id: idToDestroy,
                  }),
                ),
              },
          update: (cache, { data }) => {
            if (skipOptimisticEffect) {
              return;
            }
            const records = data?.[mutationResponseField];

            if (!isDefined(records) || records.length === 0) return;

            triggerDestroyRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToDestroy: cachedRecords,
              objectMetadataItems,
              upsertRecordsInStore,
              objectPermissionsByObjectMetadataId,
            });
          },
        })
        .catch((error: Error) => {
          if (cachedRecords.length > 0 && !skipOptimisticEffect) {
            triggerCreateRecordsOptimisticEffect({
              cache: apolloCoreClient.cache,
              objectMetadataItem,
              recordsToCreate: cachedRecords,
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          }
          throw error;
        });

      if (delayInMsBetweenMutations > 0) {
        await sleep(delayInMsBetweenMutations);
      }
    }
  };

  const incrementalDestroyManyRecords = async () => {
    let totalDestroyedCount = 0;

    await incrementalFetchAndMutate(
      async ({ recordIds, totalCount, abortSignal }) => {
        await destroyManyRecordsBatch(recordIds, abortSignal);

        totalDestroyedCount += recordIds.length;

        updateProgress(totalDestroyedCount, totalCount);
      },
    );

    await refetchAggregateQueries();

    registerObjectOperation(objectMetadataItem, {
      type: 'destroy-many',
    });

    return totalDestroyedCount;
  };

  return { incrementalDestroyManyRecords, progress, isProcessing };
};
