import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useOpenJunctionRelationPicker } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationPicker';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useOpenJunctionRelationFieldInput = () => {
  const { openJunctionRelationPicker } = useOpenJunctionRelationPicker();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const store = useStore();

  const openJunctionRelationFieldInput = useCallback(
    ({
      fieldDefinition,
      recordId,
      prefix,
      recordPickerInstanceId,
    }: {
      fieldDefinition: FieldDefinition<FieldRelationMetadata>;
      recordId: string;
      prefix?: string;
      recordPickerInstanceId?: string;
    }) => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const sourceObjectMetadataId = objectMetadataItems.find(
        (item) =>
          item.nameSingular ===
          fieldDefinition.metadata.objectMetadataNameSingular,
      )?.id;

      const junctionConfig = resolveJunctionConfig({
        settings: fieldDefinition.metadata.settings,
        relationObjectMetadataId:
          fieldDefinition.metadata.relationObjectMetadataId,
        relationTargetFieldMetadataId:
          fieldDefinition.metadata.relationFieldMetadataId,
        sourceObjectMetadataId,
        objectMetadataItems,
      });

      if (!isUsableJunctionConfig(junctionConfig)) {
        return;
      }

      const resolvedRecordPickerInstanceId =
        recordPickerInstanceId ??
        getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix,
        });

      const junctionRecords = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
        }),
      ) as FieldRelationValue<FieldRelationFromManyValue>;

      openJunctionRelationPicker({
        recordPickerInstanceId: resolvedRecordPickerInstanceId,
        junctionRecords,
        targetFields: junctionConfig.targetFields,
      });

      pushFocusItemToFocusStack({
        focusId: resolvedRecordPickerInstanceId,
        component: {
          type: FocusComponentType.DROPDOWN,
          instanceId: resolvedRecordPickerInstanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [openJunctionRelationPicker, pushFocusItemToFocusStack, store],
  );

  return { openJunctionRelationFieldInput };
};
