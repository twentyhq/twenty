import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { t } from '@lingui/core/macro';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { findJunctionRecordByTargetId } from '@/object-record/record-field/ui/utils/junction/findJunctionRecordByTargetId';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type UseUpdateJunctionRelationFromCellArgs = {
  fieldMetadataItem: FieldMetadataItem;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  recordId: string;
};

export const useUpdateJunctionRelationFromCell = ({
  fieldMetadataItem,
  fieldDefinition,
  recordId,
}: UseUpdateJunctionRelationFromCellArgs) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const sourceObjectMetadata = objectMetadataItems.find(
    (item) =>
      item.nameSingular === fieldDefinition.metadata.objectMetadataNameSingular,
  );

  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
    relationTargetFieldMetadataId:
      fieldMetadataItem.relation?.targetFieldMetadata.id,
    sourceObjectMetadataId: sourceObjectMetadata?.id,
    objectMetadataItems,
  });

  const junctionObjectMetadata = junctionConfig?.junctionObjectMetadata;
  const sourceFieldOnJunction = junctionConfig?.sourceField;

  // Use relation object name as fallback to prevent hook errors (hooks can't be conditional)
  const junctionObjectNameSingular =
    junctionObjectMetadata?.nameSingular ??
    fieldDefinition.metadata.relationObjectMetadataNameSingular;

  const { createManyRecords: createJunctionRecords } = useCreateManyRecords({
    objectNameSingular: junctionObjectNameSingular,
  });

  const { deleteOneRecord: deleteJunctionRecord } = useDeleteOneRecord({
    objectNameSingular: junctionObjectNameSingular,
  });

  const store = useStore();
  const updateJunctionRelationFromCell = useCallback(
    async ({ morphItem }: { morphItem: RecordPickerPickableMorphItem }) => {
      const targetFields = junctionConfig?.targetFields;

      if (
        !isDefined(junctionObjectMetadata) ||
        !isDefined(sourceFieldOnJunction) ||
        !isDefined(targetFields) ||
        targetFields.length === 0
      ) {
        throw new Error(
          t`Cannot update junction relation without a valid junction configuration`,
        );
      }

      if (!isDefined(sourceObjectMetadata)) {
        throw new Error(
          t`Cannot update junction relation without source object metadata`,
        );
      }

      const fieldName = fieldDefinition.metadata.fieldName;
      const junctionObjectName = junctionObjectMetadata.nameSingular;

      const targetFieldInfo = findTargetFieldInfo(
        targetFields,
        morphItem.objectMetadataId,
        objectMetadataItems,
      );

      if (!isDefined(targetFieldInfo)) {
        throw new Error(
          t`Cannot update junction relation for an unsupported target object`,
        );
      }

      const targetFieldName = targetFieldInfo.fieldName;

      const recordFromStore = store.get(
        recordStoreFamilyState.atomFamily(recordId),
      );
      const currentJunctionRecords =
        (recordFromStore?.[fieldName] as
          | FieldRelationValue<FieldRelationFromManyValue>
          | undefined) ?? [];

      const removeJunctionRecordFromStore = (junctionRecordId: string) =>
        store.set(
          recordStoreFamilyState.atomFamily(recordId),
          (currentRecord: ObjectRecord | null | undefined) => {
            if (!isDefined(currentRecord)) {
              return currentRecord;
            }

            const currentFieldValue = currentRecord[fieldName];

            if (!Array.isArray(currentFieldValue)) {
              return currentRecord;
            }

            const updatedJunctionRecords = currentFieldValue.filter(
              (junctionRecord) => junctionRecord.id !== junctionRecordId,
            );

            return updatedJunctionRecords.length === currentFieldValue.length
              ? currentRecord
              : ({
                  ...currentRecord,
                  [fieldName]: updatedJunctionRecords,
                } as ObjectRecord);
          },
        );

      // morphItem.isSelected represents the NEW state (what the user wants)
      if (!morphItem.isSelected) {
        const junctionRecordToDelete = findJunctionRecordByTargetId({
          junctionRecords: currentJunctionRecords,
          targetRecordId: morphItem.recordId,
          targetFieldName,
        });

        if (!isDefined(junctionRecordToDelete)) {
          return;
        }

        await deleteJunctionRecord(junctionRecordToDelete.id);

        // The shared delete effect normally detaches the pivot. Keep this
        // idempotent fallback for upsert-created records missing from Apollo.
        removeJunctionRecordFromStore(junctionRecordToDelete.id);
      } else {
        const searchRecord = store.get(
          searchRecordStoreFamilyState.atomFamily(morphItem.recordId),
        );

        if (!isDefined(searchRecord?.record)) {
          throw new Error(
            t`Cannot create junction relation because the target record is unavailable`,
          );
        }

        const sourceJoinColumnName = getSourceJoinColumnName({
          sourceField: sourceFieldOnJunction,
          sourceObjectMetadata,
        });
        const targetJoinColumnName = targetFieldInfo.joinColumnName;

        if (!isDefined(sourceJoinColumnName)) {
          throw new Error(
            t`Cannot create junction relation without a source join column`,
          );
        }

        if (!isDefined(targetJoinColumnName)) {
          throw new Error(
            t`Cannot create junction relation without a target join column`,
          );
        }

        const targetRecord = searchRecord.record;
        const optimisticJunctionId = v4();
        const now = new Date().toISOString();

        const junctionRecordForStore = {
          id: optimisticJunctionId,
          createdAt: now,
          updatedAt: now,
          __typename: getObjectTypename(junctionObjectName),
          [sourceJoinColumnName]: recordId,
          [targetJoinColumnName]: morphItem.recordId,
          [targetFieldName]: targetRecord,
        };

        store.set(
          recordStoreFamilyState.atomFamily(recordId),
          (currentRecord: Record<string, unknown> | null | undefined) => {
            if (!isDefined(currentRecord)) {
              return currentRecord;
            }

            const currentFieldValue = currentRecord[fieldName];
            const updatedJunctionRecords = Array.isArray(currentFieldValue)
              ? [...currentFieldValue, junctionRecordForStore]
              : [junctionRecordForStore];

            return {
              ...currentRecord,
              [fieldName]: updatedJunctionRecords,
            } as ObjectRecord;
          },
        );

        try {
          const [persistedJunctionRecordNode] = await createJunctionRecords({
            recordsToCreate: [
              {
                [sourceJoinColumnName]: recordId,
                [targetJoinColumnName]: morphItem.recordId,
              },
            ],
            upsert: true,
          });

          if (!isDefined(persistedJunctionRecordNode)) {
            throw new Error(t`Failed to create junction record`);
          }

          const persistedJunctionRecord = getRecordFromRecordNode({
            recordNode: persistedJunctionRecordNode,
          });

          store.set(
            recordStoreFamilyState.atomFamily(recordId),
            (currentRecord: Record<string, unknown> | null | undefined) => {
              if (!isDefined(currentRecord)) {
                return currentRecord;
              }

              const currentFieldValue = currentRecord[fieldName];

              if (!Array.isArray(currentFieldValue)) {
                return currentRecord as ObjectRecord;
              }

              const junctionRecordsWithoutOptimistic = currentFieldValue.filter(
                (junctionRecord) => junctionRecord.id !== optimisticJunctionId,
              );

              const isPersistedJunctionRecordAlreadyInStore =
                junctionRecordsWithoutOptimistic.some(
                  (junctionRecord) =>
                    junctionRecord.id === persistedJunctionRecord.id,
                );

              return {
                ...currentRecord,
                [fieldName]: isPersistedJunctionRecordAlreadyInStore
                  ? junctionRecordsWithoutOptimistic
                  : [
                      ...junctionRecordsWithoutOptimistic,
                      { ...junctionRecordForStore, ...persistedJunctionRecord },
                    ],
              } as ObjectRecord;
            },
          );
        } catch (error) {
          removeJunctionRecordFromStore(optimisticJunctionId);

          throw error;
        }
      }
    },
    [
      store,
      createJunctionRecords,
      deleteJunctionRecord,
      fieldDefinition.metadata.fieldName,
      junctionConfig,
      junctionObjectMetadata,
      objectMetadataItems,
      recordId,
      sourceFieldOnJunction,
      sourceObjectMetadata,
    ],
  );

  const validJunctionConfig =
    isDefined(junctionConfig) &&
    isDefined(sourceFieldOnJunction) &&
    junctionConfig.targetFields.length > 0
      ? junctionConfig
      : null;

  return {
    updateJunctionRelationFromCell,
    junctionConfig: validJunctionConfig,
  };
};
