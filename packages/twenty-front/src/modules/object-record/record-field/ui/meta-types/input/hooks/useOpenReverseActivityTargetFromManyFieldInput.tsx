import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import {
  type FieldRelationFromManyValue,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useOpenReverseActivityTargetFromManyFieldInput = () => {
  const store = useStore();
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openReverseActivityTargetFromManyFieldInput = useCallback(
    ({
      fieldName,
      recordId,
      prefix,
    }: {
      fieldName: string;
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

      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

      const isNoteField = fieldName === 'noteTargets';

      const activityObjectNameSingular = isNoteField
        ? CoreObjectNameSingular.Note
        : CoreObjectNameSingular.Task;

      const activityObjectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === activityObjectNameSingular,
      );

      if (!activityObjectMetadataItem) {
        return;
      }

      openMultipleRecordPicker(recordPickerInstanceId);

      const pickableMorphItems: RecordPickerPickableMorphItem[] =
        fieldValue
          .map((junctionRecord) => {
            const activityRecord = isNoteField
              ? (junctionRecord as NoteTarget).note
              : (junctionRecord as TaskTarget).task;

            if (!activityRecord?.id) {
              return null;
            }

            return {
              objectMetadataId: activityObjectMetadataItem.id,
              recordId: activityRecord.id,
              isSelected: true,
              isMatchingSearchFilter: true,
            };
          })
          .filter(Boolean) as RecordPickerPickableMorphItem[];

      for (const item of pickableMorphItems) {
        const record = fieldValue
          .map((j) =>
            isNoteField
              ? (j as NoteTarget).note
              : (j as TaskTarget).task,
          )
          .find((r) => r?.id === item.recordId);

        if (record) {
          store.set(recordStoreFamilyState.atomFamily(record.id), record);
        }
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
        [activityObjectMetadataItem],
      );

      performSearch({
        multipleRecordPickerInstanceId: recordPickerInstanceId,
        forceSearchFilter: '',
        forceSearchableObjectMetadataItems: [activityObjectMetadataItem],
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

  return { openReverseActivityTargetFromManyFieldInput };
};
