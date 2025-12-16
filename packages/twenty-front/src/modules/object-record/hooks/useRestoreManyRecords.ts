import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useRestoreManyRecordsMutation } from '@/object-record/hooks/useRestoreManyRecordsMutation';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRestoreManyRecordsMutationResponseField } from '@/object-record/utils/getRestoreManyRecordsMutationResponseField';
import { useRecoilValue } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

type useRestoreManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

type RestoreManyRecordsProps = {
  idsToRestore: string[];
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
};

export const useRestoreManyRecords = ({
  objectNameSingular,
}: useRestoreManyRecordProps) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const apiConfig = useRecoilValue(apiConfigState);

  const mutationPageSize =
    apiConfig?.mutationMaximumAffectedRecords ?? DEFAULT_MUTATION_BATCH_SIZE;

  const apolloCoreClient = useApolloCoreClient();

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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const mutationResponseField = getRestoreManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const restoreManyRecords = async ({
    idsToRestore,
    delayInMsBetweenRequests,
    skipOptimisticEffect = false,
  }: RestoreManyRecordsProps) => {
    const numberOfBatches = Math.ceil(idsToRestore.length / mutationPageSize);

    const restoredRecords = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdsToRestore = idsToRestore.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToRestore
        .map((idToRestore) =>
          getRecordFromCache(idToRestore, apolloCoreClient.cache),
        )
        .filter(isDefined);

      if (!skipOptimisticEffect) {
        cachedRecords.forEach((cachedRecord) => {
          const cachedRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: cachedRecord,
              objectMetadataItem,
              objectMetadataItems,
              computeReferences: true,
            });
          const computedOptimisticRecord = {
            ...cachedRecord,
            deletedAt: null,
            __typename: getObjectTypename(objectMetadataItem.nameSingular),
          };
          const optimisticRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: computedOptimisticRecord,
              objectMetadataItem,
              objectMetadataItems,
              computeReferences: true,
            });

          if (
            isDefined(optimisticRecordWithConnection) &&
            isDefined(cachedRecordWithConnection)
          ) {
            const recordGqlFields = {
              deletedAt: true,
            };
            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloCoreClient.cache,
              record: computedOptimisticRecord,
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });
            triggerUpdateRecordOptimisticEffect({
              cache: apolloCoreClient.cache,
              objectMetadataItem,
              currentRecord: cachedRecordWithConnection,
              updatedRecord: optimisticRecordWithConnection,
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          }
        });
      }

      const restoredRecordsResponse = await apolloCoreClient
        .mutate({
          mutation: restoreManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToRestore } },
          },
        })
        .catch((error: Error) => {
          if (skipOptimisticEffect) {
            throw error;
          }
          cachedRecords.forEach((cachedRecord) => {
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
              isDefined(optimisticRecordWithConnection) &&
              isDefined(cachedRecordWithConnection)
            ) {
              const recordGqlFields = {
                deletedAt: true,
              };
              updateRecordFromCache({
                objectMetadataItems,
                objectMetadataItem,
                cache: apolloCoreClient.cache,
                record: cachedRecord,
                recordGqlFields,
                objectPermissionsByObjectMetadataId,
              });

              triggerUpdateRecordOptimisticEffect({
                cache: apolloCoreClient.cache,
                objectMetadataItem,
                currentRecord: optimisticRecordWithConnection,
                updatedRecord: cachedRecordWithConnection,
                objectMetadataItems,
                objectPermissionsByObjectMetadataId,
                upsertRecordsInStore,
              });
            }
          });

          throw error;
        });

      const restoredRecordsForThisBatch =
        restoredRecordsResponse.data?.[mutationResponseField] ?? [];

      restoredRecords.push(...restoredRecordsForThisBatch);

      registerObjectOperation(objectMetadataItem, {
        type: 'restore-many',
      });

      if (isDefined(delayInMsBetweenRequests)) {
        await sleep(delayInMsBetweenRequests);
      }
    }

    return restoredRecords;
  };

  return { restoreManyRecords };
};
