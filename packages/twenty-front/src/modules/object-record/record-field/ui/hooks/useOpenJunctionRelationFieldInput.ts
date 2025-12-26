import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationMetadataSettings,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useOpenJunctionRelationFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openJunctionRelationFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        fieldDefinition,
        recordId,
        prefix,
      }: {
        fieldDefinition: FieldDefinition<FieldRelationMetadata>;
        recordId: string;
        prefix?: string;
      }) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        // Get the actual field metadata item with saved settings from the database
        const { fieldMetadataItem } = getFieldMetadataItemById({
          fieldMetadataId: fieldDefinition.fieldMetadataId,
          objectMetadataItems,
        });

        const settings =
          fieldMetadataItem?.settings as FieldRelationMetadataSettings;

        if (
          !isDefined(settings) ||
          !isNonEmptyArray(settings.junctionTargetRelationFieldIds)
        ) {
          return;
        }

        const recordPickerInstanceId = getRecordFieldInputInstanceId({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          prefix,
        });

        // Get junction records from the field value
        const junctionRecords = snapshot
          .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
            recordStoreFamilySelector({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          )
          .getValue();

        // Find the junction object metadata (target of the ONE_TO_MANY relation)
        const junctionObjectMetadataId =
          fieldDefinition.metadata.relationObjectMetadataId;
        const junctionObjectMetadata = objectMetadataItems.find(
          (item) => item.id === junctionObjectMetadataId,
        );

        if (!isDefined(junctionObjectMetadata)) {
          return;
        }

        // Find the target field on the junction object using junctionTargetRelationFieldIds
        const targetFieldId = settings.junctionTargetRelationFieldIds[0];
        const targetField = junctionObjectMetadata.fields.find(
          (field) => field.id === targetFieldId,
        );

        if (!isDefined(targetField) || !isDefined(targetField.relation)) {
          return;
        }

        // Get the actual target object metadata (e.g., Rocket, not PetRocket)
        const targetObjectMetadataId =
          targetField.relation.targetObjectMetadata.id;
        const targetObjectMetadata = objectMetadataItems.find(
          (item) => item.id === targetObjectMetadataId,
        );

        if (!isDefined(targetObjectMetadata)) {
          return;
        }

        // Extract currently selected target objects from junction records
        const selectedTargetRecords: Array<{
          recordId: string;
          objectMetadataId: string;
        }> = [];

        if (isDefined(junctionRecords) && Array.isArray(junctionRecords)) {
          for (const junctionRecord of junctionRecords) {
            if (!isDefined(junctionRecord)) continue;

            // Get the target object from the junction record using the target field name
            const targetObject = junctionRecord[targetField.name];
            if (
              isDefined(targetObject) &&
              typeof targetObject === 'object' &&
              'id' in targetObject
            ) {
              selectedTargetRecords.push({
                recordId: (targetObject as { id: string }).id,
                objectMetadataId: targetObjectMetadataId,
              });
            }
          }
        }

        // Only show the target object type in the picker (e.g., only Rockets)
        const searchableObjectMetadataItems = [targetObjectMetadata];

        const pickableMorphItems = selectedTargetRecords.map((record) => ({
          recordId: record.recordId,
          objectMetadataId: record.objectMetadataId,
          isSelected: true,
          isMatchingSearchFilter: true,
        }));

        set(
          multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          pickableMorphItems,
        );

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: recordPickerInstanceId },
          ),
          searchableObjectMetadataItems,
        );

        set(
          multipleRecordPickerSearchFilterComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          '',
        );

        openMultipleRecordPicker(recordPickerInstanceId);

        performSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
          forcePickableMorphItems: pickableMorphItems,
        });

        pushFocusItemToFocusStack({
          focusId: recordPickerInstanceId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: recordPickerInstanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      },
    [openMultipleRecordPicker, performSearch, pushFocusItemToFocusStack],
  );

  return { openJunctionRelationFieldInput };
};
