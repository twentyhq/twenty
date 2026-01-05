import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpdateManyRecordsMutation } from '@/object-record/hooks/useUpdateManyRecordsMutation';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getUpdateManyRecordsMutationResponseField } from '@/object-record/utils/getUpdateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

type UseUpdateManyRecordsProps = {
  objectNameSingular: string;
  recordGqlFields?: Record<string, any>;
};

export type UpdateManyRecordsProps<T extends ObjectRecord = ObjectRecord> = {
  recordIdsToUpdate: string[];
  updateOneRecordInput: Partial<Omit<T, 'id'>>;
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
  skipRegisterObjectOperation?: boolean;
  skipRefetchAggregateQueries?: boolean;
  abortSignal?: AbortSignal;
};

export const useUpdateManyRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  recordGqlFields,
}: UseUpdateManyRecordsProps) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const apiConfig = useRecoilValue(apiConfigState);

  const mutationPageSize =
    apiConfig?.mutationMaximumAffectedRecords ?? DEFAULT_MUTATION_BATCH_SIZE;

  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular,
      depth: 1,
    });

  const computedRecordGqlFields = recordGqlFields ?? depthOneRecordGqlFields;

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const { updateManyRecordsMutation } = useUpdateManyRecordsMutation({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const mutationResponseField = getUpdateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const updateManyRecords = async ({
    recordIdsToUpdate,
    updateOneRecordInput,
    delayInMsBetweenRequests,
    skipOptimisticEffect = false,
    skipRegisterObjectOperation = false,
    skipRefetchAggregateQueries = false,
    abortSignal,
  }: UpdateManyRecordsProps<T>) => {
    const numberOfBatches = Math.ceil(
      recordIdsToUpdate.length / mutationPageSize,
    );
    const updatedRecords: ObjectRecord[] = [];

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchedIdsToUpdate = recordIdsToUpdate.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );

      const cachedRecords = batchedIdsToUpdate
        .map((idToUpdate) =>
          getRecordFromCache(idToUpdate, apolloCoreClient.cache),
        )
        .filter(isDefined);

      const cachedRecordsNode: RecordGqlNode[] = [];
      const computedOptimisticRecordsNode: RecordGqlNode[] = [];
      const computedOptimisticRecords: ObjectRecord[] = [];

      if (!skipOptimisticEffect) {
        cachedRecords.forEach((cachedRecord) => {
          const cachedRecordNode = getRecordNodeFromRecord<ObjectRecord>({
            record: cachedRecord,
            objectMetadataItem,
            objectMetadataItems,
            recordGqlFields: computedRecordGqlFields,
            computeReferences: false,
          });

          const computedOptimisticRecord = {
            ...cachedRecord,
            ...updateOneRecordInput,
            __typename: getObjectTypename(objectMetadataItem.nameSingular),
          };

          computedOptimisticRecords.push(computedOptimisticRecord);

          const optimisticRecordNode = getRecordNodeFromRecord<ObjectRecord>({
            record: computedOptimisticRecord,
            objectMetadataItem,
            objectMetadataItems,
            recordGqlFields: computedRecordGqlFields,
            computeReferences: false,
          });

          if (isDefined(optimisticRecordNode) && isDefined(cachedRecordNode)) {
            const recordGqlFieldsFromRecord =
              generateDepthRecordGqlFieldsFromRecord({
                objectMetadataItem,
                objectMetadataItems,
                record: updateOneRecordInput,
                depth: 1,
              });

            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloCoreClient.cache,
              record: computedOptimisticRecord,
              recordGqlFields: recordGqlFieldsFromRecord,
              objectPermissionsByObjectMetadataId,
            });

            computedOptimisticRecordsNode.push(optimisticRecordNode);
            cachedRecordsNode.push(cachedRecordNode);
          }
        });

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

      const sanitizedInput = sanitizeRecordInput({
        objectMetadataItem,
        recordInput: updateOneRecordInput,
      });

      const updatedRecordsResponse = await apolloCoreClient
        .mutate<Record<string, ObjectRecord[]>>({
          mutation: updateManyRecordsMutation,
          variables: {
            filter: { id: { in: batchedIdsToUpdate } },
            data: sanitizedInput,
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

          const revertedCachedRecordsNode: RecordGqlNode[] = [];
          const revertedOptimisticRecordsNode: RecordGqlNode[] = [];

          cachedRecords.forEach((cachedRecord, index) => {
            const recordGqlFieldsFromRecord =
              generateDepthRecordGqlFieldsFromRecord({
                objectMetadataItem,
                objectMetadataItems,
                record: cachedRecord,
                depth: 1,
              });

            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloCoreClient.cache,
              record: cachedRecord,
              recordGqlFields: recordGqlFieldsFromRecord,
              objectPermissionsByObjectMetadataId,
            });

            const cachedRecordWithConnection =
              getRecordNodeFromRecord<ObjectRecord>({
                record: cachedRecord,
                objectMetadataItem,
                objectMetadataItems,
                recordGqlFields: computedRecordGqlFields,
                computeReferences: false,
              });

            const optimisticRecordWithConnection =
              computedOptimisticRecordsNode[index];

            if (
              isDefined(optimisticRecordWithConnection) &&
              isDefined(cachedRecordWithConnection)
            ) {
              revertedCachedRecordsNode.push(cachedRecordWithConnection);
              revertedOptimisticRecordsNode.push(
                optimisticRecordWithConnection,
              );
            }
          });

          triggerUpdateRecordOptimisticEffectByBatch({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            currentRecords: revertedOptimisticRecordsNode,
            updatedRecords: revertedCachedRecordsNode,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
            upsertRecordsInStore,
          });

          throw error;
        });

      const updatedRecordsForThisBatch =
        updatedRecordsResponse.data?.[mutationResponseField] ?? [];
      updatedRecords.push(...updatedRecordsForThisBatch);

      if (isDefined(delayInMsBetweenRequests)) {
        await sleep(delayInMsBetweenRequests);
      }
    }

    if (!skipRefetchAggregateQueries) {
      await refetchAggregateQueries();
    }

    if (!skipRegisterObjectOperation) {
      registerObjectOperation(objectMetadataItem, {
        type: 'update-many',
        result: {
          updateInputs: recordIdsToUpdate.map((id) => ({
            id,
            ...updateOneRecordInput,
          })),
        },
      });
    }

    return updatedRecords;
  };

  return { updateManyRecords };
};
