import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRelationFromManyFieldInputInstanceId } from '@/object-record/record-field/meta-types/input/utils/getRelationFromManyFieldInputInstanceId';
import {
  FieldRelationFromManyValue,
  FieldRelationValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useOpenRelationFromManyFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openRelationFromManyFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        fieldName,
        objectNameSingular,
        recordId,
      }: {
        fieldName: string;
        objectNameSingular: string;
        recordId: string;
      }) => {
        const recordPickerInstanceId = getRelationFromManyFieldInputInstanceId({
          recordId,
          fieldName,
        });

        const fieldValue = snapshot
          .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
            recordStoreFamilySelector({
              recordId,
              fieldName,
            }),
          )
          .getValue();

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === objectNameSingular,
        );

        if (!objectMetadataItem) {
          return;
        }

        const pickableMorphItems: RecordPickerPickableMorphItem[] =
          fieldValue.map((record) => {
            return {
              objectMetadataId: objectMetadataItem.id,
              recordId: record.id,
              isSelected: true,
              isMatchingSearchFilter: true,
            };
          });

        for (const record of fieldValue) {
          set(recordStoreFamilyState(record.id), record);
        }

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
          [objectMetadataItem],
        );

        performSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: [objectMetadataItem],
          forcePickableMorphItems: pickableMorphItems,
        });

        pushFocusItemToFocusStack({
          focusId: recordPickerInstanceId,
          component: {
            type: FocusComponentType.DROPDOWN,
            instanceId: recordPickerInstanceId,
          },
          hotkeyScope: {
            scope: DropdownHotkeyScope.Dropdown,
          },
          memoizeKey: recordPickerInstanceId,
        });
      },
    [performSearch, pushFocusItemToFocusStack],
  );

  return { openRelationFromManyFieldInput };
};
