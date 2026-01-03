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
import { findJunctionRecordByTargetId } from '@/object-record/record-field/ui/utils/findJunctionRecordByTargetId';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/getJunctionConfig';
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

  // Get source object metadata (the object that has this field)
  const sourceObjectMetadata = objectMetadataItems.find(
    (item) =>
      item.nameSingular === fieldDefinition.metadata.objectMetadataNameSingular,
  );

  // Get junction config using shared utility
  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
    sourceObjectMetadataId: sourceObjectMetadata?.id,
    objectMetadataItems,
  });

  const junctionObjectMetadata = junctionConfig?.junctionObjectMetadata;
  const targetField = junctionConfig?.targetField;
  const morphFields = junctionConfig?.morphFields;
  const isMorphRelation = junctionConfig?.isMorphRelation ?? false;
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
        if (
          !isDefined(junctionObjectMetadata) ||
          !isDefined(sourceFieldOnJunction)
        ) {
          return;
        }

        // For morph relations, need morphFields; for regular, need targetField
        if (isMorphRelation && !isDefined(morphFields)) {
          return;
        }
        if (!isMorphRelation && !isDefined(targetField)) {
          return;
        }

        const sourceFieldName = sourceFieldOnJunction.name;
        const fieldName = fieldDefinition.metadata.fieldName;
        const junctionObjectName = junctionObjectMetadata.nameSingular;

        // For MORPH relations, find the target field name from morphFields based on picked object
        let targetFieldName: string | undefined;
        if (isMorphRelation && isDefined(morphFields)) {
          const matchingMorphField = morphFields.find(
            (field) =>
              field.relation?.targetObjectMetadata.id ===
              morphItem.objectMetadataId,
          );
          targetFieldName = matchingMorphField?.name;
        } else if (isDefined(targetField)) {
          targetFieldName = targetField.name;
        }

        if (!isDefined(targetFieldName)) {
          return;
        }

        // Read current junction records from the store (always fresh)
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
            [`${sourceFieldName}Id`]: recordId,
            [`${targetFieldName}Id`]: morphItem.recordId,
            [targetFieldName]: targetRecord,
          };

          const newJunctionRecordForApi = {
            id: newJunctionId,
            [`${sourceFieldName}Id`]: recordId,
            [`${targetFieldName}Id`]: morphItem.recordId,
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
      isMorphRelation,
      junctionObjectMetadata,
      morphFields,
      recordId,
      sourceFieldOnJunction,
      targetField,
    ],
  );

  const isJunctionConfigValid =
    isDefined(junctionConfig) && isDefined(sourceFieldOnJunction);

  return {
    updateJunctionRelationFromCell,
    isJunctionConfigValid,
  };
};
