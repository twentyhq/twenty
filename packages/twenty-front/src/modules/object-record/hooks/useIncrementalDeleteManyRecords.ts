import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFetchMoreRecordsWithPagination';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

const DEFAULT_DELAY_BETWEEN_MUTATIONS_MS = 50;

type UseIncrementalDeleteManyRecordsParams<T> = Omit<
  UseFindManyRecordsParams<T>,
  'skip'
> & {
  objectNameSingular: string;
  pageSize?: number;
  delayInMsBetweenMutations?: number;
  skipOptimisticEffect?: boolean;
};

export const useIncrementalDeleteManyRecords = <T>({
  objectNameSingular,
  filter,
  orderBy,
  pageSize = DEFAULT_QUERY_PAGE_SIZE,
  delayInMsBetweenMutations = DEFAULT_DELAY_BETWEEN_MUTATIONS_MS,
  skipOptimisticEffect = false,
}: UseIncrementalDeleteManyRecordsParams<T>) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const mutationPageSize = pageSize;

  const apolloCoreClient = useApolloCoreClient();

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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { incrementalFetchAndMutate, progress, isProcessing, updateProgress } =
    useIncrementalFetchAndMutateRecords<T>({
      objectNameSingular,
      filter,
      orderBy,
      limit: pageSize,
      recordGqlFields: { id: true },
    });

  const buildOptimisticRecordNodes = useCallback(
    (cachedRecords: ObjectRecord[], timestamp: string) => {
      const cachedRecordsNode: RecordGqlNode[] = [];
      const computedOptimisticRecordsNode: RecordGqlNode[] = [];

      const recordGqlFields = {
        deletedAt: true,
      };

      cachedRecords.forEach((cachedRecord) => {
        const cachedRecordNode = getRecordNodeFromRecord<ObjectRecord>({
          record: cachedRecord,
          objectMetadataItem,
          objectMetadataItems,
          computeReferences: false,
        });

        const computedOptimisticRecord = {
          ...cachedRecord,
          deletedAt: timestamp,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        const optimisticRecordNode = getRecordNodeFromRecord<ObjectRecord>({
          record: computedOptimisticRecord,
          objectMetadataItem,
          objectMetadataItems,
          computeReferences: false,
        });

        if (isDefined(optimisticRecordNode) && isDefined(cachedRecordNode)) {
          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloCoreClient.cache,
            record: computedOptimisticRecord,
            recordGqlFields,
            objectPermissionsByObjectMetadataId,
          });

          computedOptimisticRecordsNode.push(optimisticRecordNode);
          cachedRecordsNode.push(cachedRecordNode);
        }
      });

      return { cachedRecordsNode, computedOptimisticRecordsNode };
    },
    [
      apolloCoreClient.cache,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const deleteManyRecordsBatch = async (
    recordIdsToDelete: string[],
    abortSignal: AbortSignal,
  ) => {
    const numberOfBatches = Math.ceil(
      recordIdsToDelete.length / mutationPageSize,
    );

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdsToDelete = recordIdsToDelete.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToDelete
        .map((idToDelete) =>
          getRecordFromCache(idToDelete, apolloCoreClient.cache),
        )
        .filter(isDefined);

      if (!skipOptimisticEffect) {
        const currentTimestamp = new Date().toISOString();
        const { cachedRecordsNode, computedOptimisticRecordsNode } =
          buildOptimisticRecordNodes(cachedRecords, currentTimestamp);

        triggerUpdateRecordOptimisticEffectByBatch({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          currentRecords: cachedRecordsNode,
          updatedRecords: computedOptimisticRecordsNode,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });
      }

      await apolloCoreClient
        .mutate<Record<string, ObjectRecord[]>>({
          mutation: deleteManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToDelete } },
          },
          context: {
            fetchOptions: {
              signal: abortSignal,
            },
          },
        })
        .catch((error: Error) => {
          if (skipOptimisticEffect) {
            throw error;
          }

          const recordGqlFields = {
            deletedAt: true,
          };

          cachedRecords.forEach((cachedRecord) => {
            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloCoreClient.cache,
              record: { ...cachedRecord, deletedAt: null },
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });
          });

          const currentTimestamp = new Date().toISOString();
          const { cachedRecordsNode, computedOptimisticRecordsNode } =
            buildOptimisticRecordNodes(cachedRecords, currentTimestamp);

          triggerUpdateRecordOptimisticEffectByBatch({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            currentRecords: computedOptimisticRecordsNode,
            updatedRecords: cachedRecordsNode,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
            upsertRecordsInStore,
          });

          throw error;
        });

      if (delayInMsBetweenMutations > 0) {
        await sleep(delayInMsBetweenMutations);
      }
    }
  };

  const incrementalDeleteManyRecords = async () => {
    let totalDeletedCount = 0;

    await incrementalFetchAndMutate(
      async ({ recordIds, totalCount, abortSignal }) => {
        await deleteManyRecordsBatch(recordIds, abortSignal);

        totalDeletedCount += recordIds.length;

        updateProgress(totalDeletedCount, totalCount);
      },
    );

    await refetchAggregateQueries();

    registerObjectOperation(objectMetadataItem, {
      type: 'delete-many',
    });

    return totalDeletedCount;
  };

  return { incrementalDeleteManyRecords, progress, isProcessing };
};
