import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import {
  type FieldRelationFromManyValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useStore } from 'jotai';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useCallback } from 'react';

export const useOpenRelationFromManyFieldInput = () => {
  const store = useStore();
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openRelationFromManyFieldInput = useCallback(
    ({
      fieldName,
      objectNameSingular,
      recordId,
      prefix,
    }: {
      fieldName: string;
      objectNameSingular: string;
      recordId: string;
      prefix?: string;
    }) => {
      const recordPickerInstanceId = getRecordFieldInputInstanceId({
        recordId,
        fieldName,
        prefix,
      });

      const fieldValue =
        (store.get(
          recordStoreFamilySelector.selectorFamily({ recordId, fieldName }),
        ) as FieldRelationValue<FieldRelationFromManyValue>) ?? [];

      const objectMetadataItems = store.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      );

      if (!objectMetadataItem) {
        return;
      }

      openMultipleRecordPicker(recordPickerInstanceId);

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
        store.set(recordStoreFamilyState.atomFamily(record.id), record);
      }

      store.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: recordPickerInstanceId,
        }),
        pickableMorphItems,
      );

      store.set(
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
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    [store, openMultipleRecordPicker, performSearch, pushFocusItemToFocusStack],
  );

  return { openRelationFromManyFieldInput };
};
