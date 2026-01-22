import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
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
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

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
    sourceObjectMetadataId: sourceObjectMetadata?.id,
    objectMetadataItems,
  });

  const junctionObjectMetadata = junctionConfig?.junctionObjectMetadata;
  const sourceFieldOnJunction = junctionConfig?.sourceField;

  // Use relation object name as fallback to prevent hook errors (hooks can't be conditional)
  const junctionObjectNameSingular =
    junctionObjectMetadata?.nameSingular ??
    fieldDefinition.metadata.relationObjectMetadataNameSingular;

  // Skip the post-optimistic effect since we handle optimistic updates manually
  // Otherwise Apollo would also add the record, resulting in duplicates
  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular: junctionObjectNameSingular,
    skipPostOptimisticEffect: true,
  });

  const { deleteOneRecord: deleteJunctionRecord } = useDeleteOneRecord({
    objectNameSingular: junctionObjectNameSingular,
  });

  const updateJunctionRelationFromCell = useRecoilCallback(
    ({ snapshot, set }) =>
      async ({ morphItem }: { morphItem: RecordPickerPickableMorphItem }) => {
        const targetFields = junctionConfig?.targetFields;

        if (
          !isDefined(junctionObjectMetadata) ||
          !isDefined(sourceFieldOnJunction) ||
          !isDefined(targetFields) ||
          targetFields.length === 0
        ) {
          return;
        }

        if (!isDefined(sourceObjectMetadata)) {
          return;
        }

        const sourceJoinColumnName = getSourceJoinColumnName({
          sourceField: sourceFieldOnJunction,
          sourceObjectMetadata,
        });

        const fieldName = fieldDefinition.metadata.fieldName;
        const junctionObjectName = junctionObjectMetadata.nameSingular;

        const targetFieldInfo = findTargetFieldInfo(
          targetFields,
          morphItem.objectMetadataId,
          objectMetadataItems,
        );

        if (!isDefined(targetFieldInfo)) {
          return;
        }

        const targetFieldName = targetFieldInfo.fieldName;
        const targetJoinColumnName = targetFieldInfo.joinColumnName;

        if (
          !isDefined(sourceJoinColumnName) ||
          !isDefined(targetJoinColumnName)
        ) {
          return;
        }

        const currentJunctionRecords =
          snapshot
            .getLoadable<
              FieldRelationValue<FieldRelationFromManyValue>
            >(recordStoreFamilySelector({ recordId, fieldName }))
            .getValue() ?? [];

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

          const currentFieldValue = snapshot
            .getLoadable<
              FieldRelationValue<FieldRelationFromManyValue>
            >(recordStoreFamilySelector({ recordId, fieldName }))
            .getValue();

          if (
            !isDefined(currentFieldValue) ||
            !Array.isArray(currentFieldValue)
          ) {
            return;
          }

          const updatedJunctionRecords = currentFieldValue.filter(
            (record) => record.id !== junctionRecordToDelete.id,
          );

          set(recordStoreFamilyState(recordId), (currentRecord) => {
            if (!isDefined(currentRecord)) {
              return currentRecord;
            }
            return {
              ...currentRecord,
              [fieldName]: updatedJunctionRecords,
            };
          });
        } else {
          const searchRecord = snapshot
            .getLoadable(searchRecordStoreFamilyState(morphItem.recordId))
            .getValue();

          if (!isDefined(searchRecord?.record)) {
            return;
          }

          const targetRecord = searchRecord.record;
          const newJunctionId = v4();
          const now = new Date().toISOString();

          const junctionRecordForStore = {
            id: newJunctionId,
            createdAt: now,
            updatedAt: now,
            __typename: getObjectTypename(junctionObjectName),
            [sourceJoinColumnName]: recordId,
            [targetJoinColumnName]: morphItem.recordId,
            [targetFieldName]: targetRecord,
          };

          const newJunctionRecordForApi = {
            id: newJunctionId,
            [sourceJoinColumnName]: recordId,
            [targetJoinColumnName]: morphItem.recordId,
          };

          set(recordStoreFamilyState(recordId), (currentRecord) => {
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
            };
          });

          await createJunctionRecord(newJunctionRecordForApi);
        }
      },
    [
      createJunctionRecord,
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

  const isJunctionConfigValid =
    isDefined(junctionConfig) &&
    isDefined(sourceFieldOnJunction) &&
    isDefined(junctionConfig.targetFields) &&
    junctionConfig.targetFields.length > 0;

  return {
    updateJunctionRelationFromCell,
    isJunctionConfigValid,
  };
};
