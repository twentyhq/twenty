import { useApolloClient } from '@apollo/client';

import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getDeleteManyRecordsMutationResponseField } from '@/object-record/utils/getDeleteManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

type useDeleteManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export type DeleteManyRecordsProps = {
  recordIdsToDelete: string[];
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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const mutationResponseField = getDeleteManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const deleteManyRecords = async ({
    recordIdsToDelete,
    delayInMsBetweenRequests,
    skipOptimisticEffect = false,
  }: DeleteManyRecordsProps) => {
    const numberOfBatches = Math.ceil(
      recordIdsToDelete.length / mutationPageSize,
    );
    const deletedRecords = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdsToDelete = recordIdsToDelete.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToDelete
        .map((idToDelete) => getRecordFromCache(idToDelete, apolloClient.cache))
        .filter(isDefined);
      const currentTimestamp = new Date().toISOString();
      if (!skipOptimisticEffect) {
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
            deletedAt: currentTimestamp,
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
              cache: apolloClient.cache,
              record: computedOptimisticRecord,
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });

            computedOptimisticRecordsNode.push(optimisticRecordNode);
            cachedRecordsNode.push(cachedRecordNode);
          }
        });

        triggerUpdateRecordOptimisticEffectByBatch({
          cache: apolloClient.cache,
          objectMetadataItem,
          currentRecords: cachedRecordsNode,
          updatedRecords: computedOptimisticRecordsNode,
          objectMetadataItems,
        });
      }

      const deletedRecordsResponse = await apolloClient
        .mutate<Record<string, ObjectRecord[]>>({
          mutation: deleteManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToDelete } },
          },
        })
        .catch((error: Error) => {
          if (skipOptimisticEffect) {
            throw error;
          }

          const cachedRecordsNode: RecordGqlNode[] = [];
          const computedOptimisticRecordsNode: RecordGqlNode[] = [];

          const recordGqlFields = {
            deletedAt: true,
          };
          cachedRecords.forEach((cachedRecord) => {
            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloClient.cache,
              record: { ...cachedRecord, deletedAt: null },
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });

            const cachedRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: cachedRecord,
                objectMetadataItem,
                objectMetadataItems,
                computeReferences: false,
              });

            const computedOptimisticRecord = {
              ...cachedRecord,
              deletedAt: currentTimestamp,
              __typename: getObjectTypename(objectMetadataItem.nameSingular),
            };

            const optimisticRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: computedOptimisticRecord,
                objectMetadataItem,
                objectMetadataItems,
                computeReferences: false,
              });

            if (
              isDefined(optimisticRecordWithConnection) &&
              isDefined(cachedRecordWithConnection)
            ) {
              cachedRecordsNode.push(cachedRecordWithConnection);
              computedOptimisticRecordsNode.push(
                optimisticRecordWithConnection,
              );
            }
          });

          triggerUpdateRecordOptimisticEffectByBatch({
            cache: apolloClient.cache,
            objectMetadataItem,
            currentRecords: computedOptimisticRecordsNode,
            updatedRecords: cachedRecordsNode,
            objectMetadataItems,
          });

          throw error;
        });

      const deletedRecordsForThisBatch =
        deletedRecordsResponse.data?.[mutationResponseField] ?? [];
      deletedRecords.push(...deletedRecordsForThisBatch);

      if (isDefined(delayInMsBetweenRequests)) {
        await sleep(delayInMsBetweenRequests);
      }
    }
    await refetchAggregateQueries();
    return deletedRecords;
  };

  return { deleteManyRecords };
};
