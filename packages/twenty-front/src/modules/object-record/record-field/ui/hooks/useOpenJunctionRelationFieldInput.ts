import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSearchableObjectMetadataItems } from '@/object-record/record-field/ui/utils/junction/getSearchableObjectMetadataItems';
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

        const sourceObjectMetadataId = objectMetadataItems.find(
          (item) =>
            item.nameSingular ===
            fieldDefinition.metadata.objectMetadataNameSingular,
        )?.id;

        const junctionConfig = getJunctionConfig({
          settings: fieldDefinition.metadata.settings,
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

        const junctionRecords = snapshot
          .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
            recordStoreFamilySelector({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
            }),
          )
          .getValue();

        const selectedTargetRecords = extractTargetRecordsFromJunction({
          junctionRecords,
          targetFields,
          objectMetadataItems,
        });

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
