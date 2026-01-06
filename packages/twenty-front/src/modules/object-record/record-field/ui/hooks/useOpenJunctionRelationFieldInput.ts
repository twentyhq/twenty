import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/getJunctionConfig';
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
import { isDefined } from 'twenty-shared/utils';

// Extract target object metadata IDs from a field (handles both RELATION and MORPH_RELATION)
const getTargetObjectMetadataIdsFromField = (
  field: FieldMetadataItem,
): string[] => {
  // Check morphRelations first - fields with morphId may have this populated
  // even if type isn't explicitly MORPH_RELATION
  if (isDefined(field.morphRelations) && field.morphRelations.length > 0) {
    return field.morphRelations
      .map((mr) => mr.targetObjectMetadata.id)
      .filter(isDefined);
  }

  // Fallback to regular relation
  const targetId = field.relation?.targetObjectMetadata.id;
  return targetId ? [targetId] : [];
};

// Get searchable object metadata items from target fields
const getSearchableObjectMetadataItems = (
  targetFields: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
): ObjectMetadataItem[] => {
  const targetObjectIds = targetFields.flatMap(
    getTargetObjectMetadataIdsFromField,
  );
  const uniqueTargetObjectIds = [...new Set(targetObjectIds)];

  return uniqueTargetObjectIds
    .map((id) => objectMetadataItems.find((item) => item.id === id))
    .filter(isDefined);
};

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

        // Get source object metadata (the object that has this field)
        const sourceObjectMetadataId = objectMetadataItems.find(
          (item) =>
            item.nameSingular ===
            fieldDefinition.metadata.objectMetadataNameSingular,
        )?.id;

        // Get junction config using shared utility
        const junctionConfig = getJunctionConfig({
          settings: fieldMetadataItem?.settings,
          relationObjectMetadataId:
            fieldDefinition.metadata.relationObjectMetadataId,
          sourceObjectMetadataId,
          objectMetadataItems,
        });

        if (!isDefined(junctionConfig)) {
          return;
        }

        const { targetFields } = junctionConfig;

        if (targetFields.length === 0) {
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

        // Extract currently selected target objects from junction records
        const selectedTargetRecords = extractTargetRecordsFromJunction({
          junctionRecords,
          targetFields,
          objectMetadataItems,
        });

        // Determine searchable object types based on target fields
        // Handles both RELATION (via field.relation) and MORPH_RELATION (via field.morphRelations)
        const searchableObjectMetadataItems = getSearchableObjectMetadataItems(
          targetFields,
          objectMetadataItems,
        );

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
