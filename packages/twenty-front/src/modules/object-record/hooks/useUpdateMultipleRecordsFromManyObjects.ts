import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateUpdateOneRecordMutation } from '@/object-record/multiple-objects/utils/generateUpdateOneRecordMutation';
import { getTargetFieldMetadataName } from '@/object-record/multiple-objects/utils/getTargetFieldMetadataName';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeOptimisticRecordFromInput } from '@/object-record/utils/computeOptimisticRecordFromInput';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { sanitizeRecordInput } from '@/object-record/utils/sanitizeRecordInput';
import { isNull } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { buildRecordFromKeysWithSameValue } from '~/utils/array/buildRecordFromKeysWithSameValue';

type UpdateManyRecordArgs = {
  idToUpdate: string;
  relatedRecordId: string | null;
  objectNameSingulars: string[];
  recordGqlFields?: Record<string, any>;
};

export const useUpdateMultipleRecordsFromManyObjects = () => {
  const { fieldDefinition } = useContext(FieldContext);
  const apolloCoreClient = useApolloCoreClient();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const updateMultipleRecordsFromManyObjects = async (
    updatedManyRecordsArgs: UpdateManyRecordArgs[],
  ) => {
    for (const {
      idToUpdate,
      objectNameSingulars,
      relatedRecordId,
      recordGqlFields,
    } of updatedManyRecordsArgs) {
      const objectMetadataItemArray = objectMetadataItems.filter(
        (objectMetadataItem) =>
          objectNameSingulars.includes(objectMetadataItem.nameSingular),
      );

      if (objectMetadataItemArray.length === 0) {
        throw new CustomError(
          `Object metadata item not found ${objectNameSingulars.join(', ')}`,
          'OBJECT_METADATA_ITEM_NOT_FOUND',
        );
      }

      const objectMetadataItemWithCachedRecord = objectMetadataItemArray
        .map((objectMetadataItem) => {
          const cachedRecord = getRecordFromCache({
            objectMetadataItem,
            recordId: idToUpdate,
            cache: apolloCoreClient.cache,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
          });
          return {
            cachedRecord,
            objectMetadataItem,
          };
        })
        .find((item) => isDefined(item.cachedRecord));

      if (!isDefined(objectMetadataItemWithCachedRecord)) {
        throw new CustomError(
          `Record not found ${idToUpdate}`,
          'RECORD_NOT_FOUND_IN_OBJECT_METADATA_ITEM',
        );
      }

      const { objectMetadataItem, cachedRecord } =
        objectMetadataItemWithCachedRecord;

      if (
        !isFieldRelation(fieldDefinition) &&
        !isFieldMorphRelation(fieldDefinition)
      ) {
        throw new CustomError(
          `Should never happen`,
          'TARGET_FIELD_NAME_NOT_FOUND',
        );
      }

      const targetFieldName = getTargetFieldMetadataName({
        fieldDefinition,
        objectNameSingular: objectMetadataItem.nameSingular,
      });

      if (!isDefined(targetFieldName)) {
        throw new CustomError(
          `Cannot find Target field name for the (morph) relation field ${fieldDefinition.metadata.fieldName} on ${objectMetadataItem.nameSingular}`,
          'TARGET_FIELD_NAME_NOT_FOUND',
        );
      }

      const updateOneRecordInput = {
        [`${targetFieldName}Id`]: relatedRecordId,
      };

      const optimisticRecordInput = computeOptimisticRecordFromInput({
        objectMetadataItem,
        currentWorkspaceMember: currentWorkspaceMember,
        recordInput: updateOneRecordInput,
        cache: apolloCoreClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });

      const computedRecordGqlFields =
        recordGqlFields ??
        generateDepthOneRecordGqlFields({ objectMetadataItem });

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
        const recordGqlFields = computeDepthOneRecordGqlFieldsFromRecord({
          objectMetadataItem,
          record: optimisticRecordInput,
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

      const mutationResponseField = getUpdateOneRecordMutationResponseField(
        objectMetadataItem.nameSingular,
      );

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

      const refetchAggregateQueries = async () => {
        const queryName = getAggregateQueryName(objectMetadataItem.namePlural);

        await apolloCoreClient.refetchQueries({
          include: [queryName],
        });
      };
      await refetchAggregateQueries();

      return updatedRecord?.data?.[mutationResponseField] ?? null;
    }
  };

  return {
    updateMultipleRecordsFromManyObjects,
  };
};
