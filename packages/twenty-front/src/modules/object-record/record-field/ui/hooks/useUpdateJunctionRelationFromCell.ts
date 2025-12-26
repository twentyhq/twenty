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
    type FieldRelationMetadataSettings,
    type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
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

  // Use fieldMetadataItem.settings which has the actual saved settings from the database
  const settings = fieldMetadataItem.settings as FieldRelationMetadataSettings;

  // Get junction object metadata
  const junctionObjectMetadataId =
    fieldDefinition.metadata.relationObjectMetadataId;
  const junctionObjectMetadata = objectMetadataItems.find(
    (item) => item.id === junctionObjectMetadataId,
  );

  // Get source object metadata (the object that has this field)
  const sourceObjectMetadata = objectMetadataItems.find(
    (item) =>
      item.nameSingular === fieldDefinition.metadata.objectMetadataNameSingular,
  );

  // Get target field info from junction
  const targetFieldId = settings?.junctionTargetRelationFieldIds?.[0];
  const targetField = junctionObjectMetadata?.fields.find(
    (field) => field.id === targetFieldId,
  );

  // Find the source field on junction (the field that points back to the source object)
  // This is the inverse of the current ONE_TO_MANY relation
  const sourceFieldOnJunction = junctionObjectMetadata?.fields.find(
    (field) =>
      field.type === 'RELATION' &&
      isDefined(sourceObjectMetadata) &&
      field.relation?.targetObjectMetadata.id === sourceObjectMetadata.id &&
      field.id !== targetFieldId,
  );

  // Skip the post-optimistic effect since we handle optimistic updates manually
  // Otherwise Apollo would also add the record, resulting in duplicates
  const { createOneRecord: createJunctionRecord } = useCreateOneRecord({
    objectNameSingular: junctionObjectMetadata?.nameSingular ?? '',
    skipPostOptimisticEffect: true,
  });

  const { deleteOneRecord: deleteJunctionRecord } = useDeleteOneRecord({
    objectNameSingular: junctionObjectMetadata?.nameSingular ?? '',
  });

  const updateJunctionRelationFromCell = useRecoilCallback(
    ({ snapshot, set }) =>
      async ({ morphItem }: { morphItem: RecordPickerPickableMorphItem }) => {
        if (
          !isDefined(junctionObjectMetadata) ||
          !isDefined(targetField) ||
          !isDefined(sourceFieldOnJunction)
        ) {
          return;
        }

        const targetFieldName = targetField.name;
        const sourceFieldName = sourceFieldOnJunction.name;

        // Read current junction records from the store (always fresh)
        const currentJunctionRecords =
          snapshot
            .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
              recordStoreFamilySelector({
                recordId,
                fieldName: fieldDefinition.metadata.fieldName,
              }),
            )
            .getValue() ?? [];

        // morphItem.isSelected represents the NEW state (what the user wants)
        // isSelected=true means user wants to SELECT (create junction)
        // isSelected=false means user wants to DESELECT (delete junction)
        if (!morphItem.isSelected) {
          // DESELECT: Find and delete the junction record
          // Check both embedded object (targetField) and ID field (targetFieldId)
          const junctionRecordToDelete = currentJunctionRecords.find(
            (junctionRecord) => {
              // Try embedded object first
              const targetObject = junctionRecord[targetFieldName];
              if (
                isDefined(targetObject) &&
                typeof targetObject === 'object' &&
                'id' in targetObject &&
                (targetObject as { id: string }).id === morphItem.recordId
              ) {
                return true;
              }
              // Fall back to ID field
              const targetId = junctionRecord[`${targetFieldName}Id`];
              return targetId === morphItem.recordId;
            },
          );

          if (isDefined(junctionRecordToDelete)) {
            await deleteJunctionRecord(junctionRecordToDelete.id);

            // Update the record store
            const currentFieldValue = snapshot
              .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
                recordStoreFamilySelector({
                  recordId,
                  fieldName: fieldDefinition.metadata.fieldName,
                }),
              )
              .getValue();

            if (
              isDefined(currentFieldValue) &&
              Array.isArray(currentFieldValue)
            ) {
              const updatedJunctionRecords = currentFieldValue.filter(
                (record) => record.id !== junctionRecordToDelete.id,
              );

              set(recordStoreFamilyState(recordId), (currentRecord) => {
                if (!isDefined(currentRecord)) {
                  return currentRecord;
                }
                return {
                  ...currentRecord,
                  [fieldDefinition.metadata.fieldName]: updatedJunctionRecords,
                };
              });
            }
          }
        } else {
          // SELECT: Create a new junction record
          // Get the target record from the search store (contains full record data)
          const searchRecord = snapshot
            .getLoadable(searchRecordStoreFamilyState(morphItem.recordId))
            .getValue();

          if (!isDefined(searchRecord) || !isDefined(searchRecord?.record)) {
            return;
          }

          const targetRecord = searchRecord.record;

          const newJunctionId = v4();
          const now = new Date().toISOString();

          // Build the junction record with embedded target record (like activity targets do)
          const junctionRecordForStore = {
            id: newJunctionId,
            createdAt: now,
            updatedAt: now,
            __typename: getObjectTypename(junctionObjectMetadata.nameSingular),
            [`${sourceFieldName}Id`]: recordId,
            [`${targetFieldName}Id`]: morphItem.recordId,
            // Embed the full target record so display works
            [targetFieldName]: targetRecord,
          };

          // For the API, we only send the IDs
          const newJunctionRecordForApi = {
            id: newJunctionId,
            [`${sourceFieldName}Id`]: recordId,
            [`${targetFieldName}Id`]: morphItem.recordId,
          };

          // Optimistically update the store
          set(recordStoreFamilyState(recordId), (currentRecord) => {
            if (!isDefined(currentRecord)) {
              return currentRecord;
            }

            const currentFieldValue =
              currentRecord[fieldDefinition.metadata.fieldName];
            const updatedJunctionRecords = Array.isArray(currentFieldValue)
              ? [...currentFieldValue, junctionRecordForStore]
              : [junctionRecordForStore];

            return {
              ...currentRecord,
              [fieldDefinition.metadata.fieldName]: updatedJunctionRecords,
            };
          });

          // Then create in the backend
          await createJunctionRecord(newJunctionRecordForApi);
        }
      },
    [
      createJunctionRecord,
      deleteJunctionRecord,
      fieldDefinition.metadata.fieldName,
      junctionObjectMetadata,
      recordId,
      sourceFieldOnJunction,
      targetField,
    ],
  );

  const isJunctionConfigValid =
    isDefined(junctionObjectMetadata) &&
    isDefined(targetField) &&
    isDefined(sourceFieldOnJunction);

  return {
    updateJunctionRelationFromCell,
    isJunctionConfigValid,
  };
};
