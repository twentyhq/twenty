import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
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
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

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

  const junctionConfig = resolveJunctionConfig({
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
        !isUsableJunctionConfig(junctionConfig) ||
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

      const recordFromStore = store.get(
        recordStoreFamilyState.atomFamily(recordId),
      );
      const currentJunctionRecords =
        (recordFromStore?.[fieldName] as
          | FieldRelationValue<FieldRelationFromManyValue>
          | undefined) ?? [];

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
      } else {
        await createJunctionRecords({
          recordsToCreate: [
            {
              [sourceJoinColumnName]: recordId,
              [targetJoinColumnName]: morphItem.recordId,
            },
          ],
          upsert: true,
        });
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

  return {
    updateJunctionRelationFromCell,
    junctionConfig,
  };
};
