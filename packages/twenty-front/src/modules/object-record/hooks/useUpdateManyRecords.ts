import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { DEFAULT_MUTATION_BATCH_SIZE } from '@/object-record/constants/DefaultMutationBatchSize';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateManyRecordsMutation } from '@/object-record/hooks/useUpdateManyRecordsMutation';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getUpdateManyRecordsMutationResponseField } from '@/object-record/utils/getUpdateManyRecordsMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';
import { sleep } from '~/utils/sleep';

type useUpdateManyRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
  recordGqlFields?: Record<string, any>;
};

export type UpdateManyRecordsProps<UpdatedObjectRecord> = {
  recordIdsToUpdate: string[];
  skipOptimisticEffect?: boolean;
  delayInMsBetweenRequests?: number;
  updateManyRecordsInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  optimisticRecord?: Partial<ObjectRecord>;
};

export const useUpdateManyRecords = <
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
}: useUpdateManyRecordProps) => {
  const apiConfig = useRecoilValue(apiConfigState);
  const mutationPageSize =
    apiConfig?.mutationMaximumAffectedRecords ?? DEFAULT_MUTATION_BATCH_SIZE;
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });

  const computedRecordGqlFields =
    recordGqlFields ?? generateDepthOneRecordGqlFields({ objectMetadataItem });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });
  const { updateManyRecordsMutation } = useUpdateManyRecordsMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });
  const mutationResponseField = getUpdateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );
  const updateManyRecords = async ({
    recordIdsToUpdate,
    delayInMsBetweenRequests,
    skipOptimisticEffect = false,
    updateManyRecordsInput,
    optimisticRecord,
  }: UpdateManyRecordsProps<UpdatedObjectRecord>) => {
    const numberOfBatches = Math.ceil(
      recordIdsToUpdate.length / mutationPageSize,
    );
    const optimisticRecordInput =
      optimisticRecord ??
      computeOptimisticRecordFromInput({
        objectMetadataItem,
        currentWorkspaceMember: currentWorkspaceMember,
        recordInput: updateManyRecordsInput,
        cache: apolloClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });
    const sanitizedInput = {
      ...sanitizeRecordInput({
        objectMetadataItem,
        recordInput: updateManyRecordsInput,
      }),
    };
    const updatedRecords = [];
    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batchIdsToUpdate = recordIdsToUpdate.slice(
        batchIndex * mutationPageSize,
        (batchIndex + 1) * mutationPageSize,
      );
      const cachedRecords = batchIdsToUpdate
        .map((idToUpdate) => getRecordFromCache(idToUpdate, apolloClient.cache))
        .filter(isDefined);
      const cashedRecordsCopy = [...cachedRecords];
      if (!skipOptimisticEffect) {
        const cachedRecordsNode: RecordGqlNode[] = [];
        const computedOptimisticRecordsNode: RecordGqlNode[] = [];
        cashedRecordsCopy.forEach((cachedRecord) => {
          const cachedRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: cachedRecord,
              objectMetadataItem,
              objectMetadataItems,
              recordGqlFields: computedRecordGqlFields,
              computeReferences: false,
            });
          const computedOptimisticRecord = {
            ...cachedRecord,
            ...optimisticRecordInput,
            __typename: getObjectTypename(objectMetadataItem.nameSingular),
          };
          const optimisticRecordWithConnection =
            getRecordNodeFromRecord<ObjectRecord>({
              record: computedOptimisticRecord,
              objectMetadataItem,
              objectMetadataItems,
              recordGqlFields: computedRecordGqlFields,
              computeReferences: false,
            });
          if (
            isDefined(optimisticRecordWithConnection) &&
            isDefined(cachedRecordWithConnection)
          ) {
            const recordGqlFields = computeDepthOneRecordGqlFieldsFromRecord({
              objectMetadataItem,
              record: optimisticRecordInput,
            });
            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloClient.cache,
              record: computedOptimisticRecord,
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });

            computedOptimisticRecordsNode.push(optimisticRecordWithConnection);
            cachedRecordsNode.push(cachedRecordWithConnection);
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

      const updatedRecordsResponse = await apolloClient
        .mutate<Record<string, ObjectRecord[]>>({
          mutation: updateManyRecordsMutation,
          variables: {
            data: sanitizedInput,
            filter: { id: { in: batchIdsToUpdate } },
          },
        })
        .catch((error: Error) => {
          if (skipOptimisticEffect) {
            throw error;
          }

          const cachedRecordsNode: RecordGqlNode[] = [];
          const computedOptimisticRecordsNode: RecordGqlNode[] = [];

          cachedRecords.forEach((cachedRecord) => {
            const cachedRecordKeys = new Set(Object.keys(cachedRecord));
            const recordKeysAddedByOptimisticCache = Object.keys(
              optimisticRecordInput,
            ).filter((diffKey) => !cachedRecordKeys.has(diffKey));

            const recordGqlFields = {
              ...computeDepthOneRecordGqlFieldsFromRecord({
                objectMetadataItem,
                record: cachedRecord,
              }),
              ...buildRecordFromKeysWithSameValue(
                recordKeysAddedByOptimisticCache,
                true,
              ),
            };

            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloClient.cache,
              record: {
                ...cachedRecord,
                ...buildRecordFromKeysWithSameValue(
                  recordKeysAddedByOptimisticCache,
                  null,
                ),
              },
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
              ...optimisticRecordInput,
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

      const updatedRecordsForThisBatch =
        updatedRecordsResponse.data?.[mutationResponseField] ?? [];
      updatedRecords.push(...updatedRecordsForThisBatch);

      if (isDefined(delayInMsBetweenRequests)) {
        await sleep(delayInMsBetweenRequests);
      }
    }
    await refetchAggregateQueries();
    return updatedRecords;
  };
  return { updateManyRecords };
};
