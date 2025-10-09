import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isNull } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

type UpdateOneRecordArgs<UpdatedObjectRecord> = {
  idToUpdate: string;
  updateOneRecordInput: Partial<Omit<UpdatedObjectRecord, 'id'>>;
  optimisticRecord?: Partial<ObjectRecord>;
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
};
export const useUpdateOneRecordV2 = () => {
  const apolloCoreClient = useApolloCoreClient();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const updateOneRecord = async <
    UpdatedObjectRecord extends ObjectRecord = ObjectRecord,
  >({
    objectNameSingular,
    recordGqlFields,
    idToUpdate,
    updateOneRecordInput,
    optimisticRecord,
  }: UpdateOneRecordArgs<UpdatedObjectRecord>) => {
    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === objectNameSingular,
    );

    if (!objectMetadataItem) {
      throw new Error(
        `Object metadata item not found for ${objectNameSingular}`,
      );
    }

    const computedRecordGqlFields =
      recordGqlFields ??
      generateDepthRecordGqlFields({ objectMetadataItem, depth: 1 });

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
      recordGqlFields,
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

          triggerUpdateRecordOptimisticEffect({
            cache,
            objectMetadataItem,
            currentRecord: computedOptimisticRecord,
            updatedRecord: record,
            objectMetadataItems,
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
        });

        throw error;
      });

    return updatedRecord?.data?.[mutationResponseField] ?? null;
  };

  return {
    updateOneRecord,
  };
};
