import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/utils/getDeleteManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { sleep } from '~/utils/sleep';

type useDeleteManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type DeleteManyRecordsOptions = {
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
};

export const useDeleteManyRecords = ({
  objectNameSingular,
}: useDeleteManyRecordProps) => {
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

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

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
      const batchedIdsToDelete = idsToDelete.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const currentTimestamp = new Date().toISOString();

      const cachedRecords = batchedIdsToDelete
        .map((idToDelete) => getRecordFromCache(idToDelete, apolloClient.cache))
        .filter(isDefined);

      const cachedRecordsWithConnection: RecordGqlNode[] = [];
      const optimisticRecordsWithConnection: RecordGqlNode[] = [];

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
            ...{ id: cachedRecord.id, deletedAt: currentTimestamp },
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

          cachedRecordsWithConnection.push(cachedRecordWithConnection);
          optimisticRecordsWithConnection.push(optimisticRecordWithConnection);

          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloClient.cache,
            record: computedOptimisticRecord,
          });
        });

        triggerUpdateRecordOptimisticEffectByBatch({
          cache: apolloClient.cache,
          objectMetadataItem,
          currentRecords: cachedRecordsWithConnection,
          updatedRecords: optimisticRecordsWithConnection,
          objectMetadataItems,
        });
      }

      const deletedRecordsResponse = await apolloClient
        .mutate({
          mutation: deleteManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToDelete } },
          },
        })
        .catch((error: Error) => {
          const cachedRecordsWithConnection: RecordGqlNode[] = [];
          const optimisticRecordsWithConnection: RecordGqlNode[] = [];

          cachedRecords.forEach((cachedRecord) => {
            if (isUndefinedOrNull(cachedRecord?.id)) {
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
              ...{ id: cachedRecord.id, deletedAt: currentTimestamp },
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
              return;
            }

            cachedRecordsWithConnection.push(cachedRecordWithConnection);
            optimisticRecordsWithConnection.push(
              optimisticRecordWithConnection,
            );
          });

          triggerUpdateRecordOptimisticEffectByBatch({
            cache: apolloClient.cache,
            objectMetadataItem,
            currentRecords: optimisticRecordsWithConnection,
            updatedRecords: cachedRecordsWithConnection,
            objectMetadataItems,
          });

          throw error;
        });

      const deletedRecordsForThisBatch =
        deletedRecordsResponse.data?.[mutationResponseField] ?? [];

      deletedRecords.push(...deletedRecordsForThisBatch);

      if (isDefined(options?.delayInMsBetweenRequests)) {
        await sleep(options.delayInMsBetweenRequests);
      }
    }
    await refetchAggregateQueries();
    return deletedRecords;
  };

  return { deleteManyRecords };
};
