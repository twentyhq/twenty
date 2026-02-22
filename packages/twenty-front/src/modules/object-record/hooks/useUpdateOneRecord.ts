import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { getUpdatedFieldsFromRecordInput } from '@/object-record/utils/getUpdatedFieldsFromRecordInput';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isNull } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

type UpdateOneRecordArgs<UpdatedObjectRecord> = {
  objectNameSingular: string;
  idToUpdate: string;
  updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  optimisticRecord?: Partial<ObjectRecord>;
  recordGqlFields?: RecordGqlFields;
};

export const useUpdateOneRecord = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { refetchAggregateQueries } = useRefetchAggregateQueries();

  const updateOneRecord = async <
    UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
  >({
    objectNameSingular,
    idToUpdate,
    updateOneRecordInput,
    optimisticRecord,
    recordGqlFields,
  }: UpdateOneRecordArgs<UpdatedObjectRecord>) => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectNameSingular,
    );

    if (!objectMetadataItem) {
      throw new Error(
        `Object metadata item not found for ${objectNameSingular}`,
      );
    }

    const optimisticRecordInput =
      optimisticRecord ??
      computeOptimisticRecordFromInput({
        objectMetadataItem,
        currentWorkspaceMember,
        recordInput: updateOneRecordInput,
        cache: apolloCoreClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });

    const computedRecordGqlFields =
      recordGqlFields ??
      generateDepthRecordGqlFieldsFromObject({
        objectMetadataItem,
        objectMetadataItems,
        depth: 1,
      });

    const cachedRecord = getRecordFromCache({
      cache: apolloCoreClient.cache,
      objectMetadataItem,
      objectMetadataItems,
      recordId: idToUpdate,
      recordGqlFields: computedRecordGqlFields,
      objectPermissionsByObjectMetadataId,
    });

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

    const updateOneRecordMutation = generateUpdateOneRecordMutation({
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields: computedRecordGqlFields,
      computeReferences: false,
      objectPermissionsByObjectMetadataId,
    });

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

    await refetchAggregateQueries({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });

    const resultRecord = updatedRecord?.data?.[mutationResponseField] ?? null;

    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation: {
        type: 'update-one',
        result: {
          updateInput: {
            recordId: idToUpdate,
            updatedFields:
              getUpdatedFieldsFromRecordInput(updateOneRecordInput),
          },
        },
      },
    });

    return resultRecord;
  };

  return {
    updateOneRecord,
  };
};
