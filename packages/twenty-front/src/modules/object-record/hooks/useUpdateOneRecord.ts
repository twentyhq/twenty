import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isNull } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

type useUpdateOneRecordProps = {
  objectNameSingular: string;
  recordGqlFields?: Record<string, any>;
};
type UpdateOneRecordArgs<UpdatedObjectRecord> = {
  idToUpdate: string;
  updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  optimisticRecord?: Partial<ObjectRecord>;
};
export const useUpdateOneRecord = <
  UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  recordGqlFields,
}: useUpdateOneRecordProps) => {
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
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

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
  });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const updateOneRecord = async ({
    idToUpdate,
    updateOneRecordInput,
    optimisticRecord,
  }: UpdateOneRecordArgs<UpdatedObjectRecord>) => {
    const optimisticRecordInput =
      optimisticRecord ??
      computeOptimisticRecordFromInput({
        objectMetadataItem,
        currentWorkspaceMember: currentWorkspaceMember,
        recordInput: updateOneRecordInput,
        cache: apolloCoreClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });
    const cachedRecord = getRecordFromCache<ObjectRecord>(idToUpdate);
    const cachedRecordWithConnection = getRecordNodeFromRecord<ObjectRecord>({
      record: cachedRecord,
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields: computedRecordGqlFields,
      computeReferences: false,
    });

    const computedOptimisticRecord = {
      ...cachedRecord,
      ...optimisticRecordInput,
      id: idToUpdate,
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

    const shouldHandleOptimisticCache =
      !isNull(cachedRecord) &&
      isDefined(optimisticRecordWithConnection) &&
      isDefined(cachedRecordWithConnection);

    if (shouldHandleOptimisticCache) {
      const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
        objectMetadataItem,
        objectMetadataItems,
        record: optimisticRecordInput,
        depth: 1,
      });

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

    const mutationResponseField =
      getUpdateOneRecordMutationResponseField(objectNameSingular);

    const sanitizedInput = {
      ...sanitizeRecordInput({
        objectMetadataItem,
        recordInput: updateOneRecordInput,
      }),
    };
    const updatedRecord = await apolloCoreClient
      .mutate({
        mutation: updateOneRecordMutation,
        variables: {
          idToUpdate,
          input: sanitizedInput,
        },
        update: (cache, { data }) => {
          const record = data?.[mutationResponseField];
          if (!isDefined(record)) return;

          const recordToUpsert = getRecordFromRecordNode({
            recordNode: record,
          });
          upsertRecordsInStore({ partialRecords: [recordToUpsert] });

          triggerUpdateRecordOptimisticEffect({
            cache,
            objectMetadataItem,
            currentRecord: computedOptimisticRecord,
            updatedRecord: record,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
            upsertRecordsInStore,
          });
        },
      })
      .catch((error: Error) => {
        if (!shouldHandleOptimisticCache) {
          throw error;
        }
        const cachedRecordKeys = new Set(Object.keys(cachedRecord));
        const recordKeysAddedByOptimisticCache = Object.keys(
          optimisticRecordInput,
        ).filter((diffKey) => !cachedRecordKeys.has(diffKey));

        const recordGqlFields = {
          ...generateDepthRecordGqlFieldsFromRecord({
            objectMetadataItem,
            objectMetadataItems,
            record: cachedRecord,
            depth: 1,
          }),
          ...buildRecordFromKeysWithSameValue(
            recordKeysAddedByOptimisticCache,
            true,
          ),
        };

        updateRecordFromCache({
          objectMetadataItems,
          objectMetadataItem,
          cache: apolloCoreClient.cache,
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

        triggerUpdateRecordOptimisticEffect({
          cache: apolloCoreClient.cache,
          objectMetadataItem,
          currentRecord: optimisticRecordWithConnection,
          updatedRecord: cachedRecordWithConnection,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });

        throw error;
      });

    await refetchAggregateQueries();

    const udpatedRecord = updatedRecord?.data?.[mutationResponseField] ?? null;

    registerObjectOperation(objectMetadataItem, {
      type: 'update-one',
      result: { updateInput: updateOneRecordInput },
    });

    return udpatedRecord;
  };

  return {
    updateOneRecord,
  };
};
