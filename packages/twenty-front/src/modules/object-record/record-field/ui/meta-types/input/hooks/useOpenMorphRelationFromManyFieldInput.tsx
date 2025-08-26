import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useOpenMorphRelationFromManyFieldInput = () => {
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openMorphRelationFromManyFieldInput = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        fieldName,
        objectNameSingulars,
        recordId,
        prefix,
      }: {
        fieldName: string;
        objectNameSingulars: string[];
        recordId: string;
        prefix?: string;
      }) => {
        const recordPickerInstanceId = getRecordFieldInputInstanceId({
          recordId,
          fieldName,
          prefix,
        });

        // const fieldValue = snapshot
        //   .getLoadable<FieldRelationValue<FieldRelationFromManyValue>>(
        //     recordStoreFamilySelector({
        //       recordId,
        //       fieldName,
        //     }),
        //   )
        //   .getValue();

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItemArray = objectMetadataItems.filter(
          (objectMetadataItem) =>
            objectNameSingulars.includes(objectMetadataItem.nameSingular),
        );

        if (
          !isDefined(objectMetadataItemArray) ||
          objectMetadataItemArray.length === 0
        ) {
          return;
        }

        openMultipleRecordPicker(recordPickerInstanceId);

        // todo @guillim
        // const pickableMorphItems: RecordPickerPickableMorphItem[] =
        //   fieldValue.map((record) => {
        //     return {
        //       objectMetadataId: objectMetadataItem.id,
        //       recordId: record.id,
        //       isSelected: true,
        //       isMatchingSearchFilter: true,
        //     };
        //   });

        // for (const record of fieldValue) {
        //   set(recordStoreFamilyState(record.id), record);
        // }

        // set(
        //   multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
        //     instanceId: recordPickerInstanceId,
        //   }),
        //   pickableMorphItems,
        // );

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            { instanceId: recordPickerInstanceId },
          ),
          objectMetadataItemArray,
        );

        performSearch({
          multipleRecordPickerInstanceId: recordPickerInstanceId,
          forceSearchFilter: '',
          forceSearchableObjectMetadataItems: objectMetadataItemArray,
          // forcePickableMorphItems: pickableMorphItems,
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

  return { openMorphRelationFromManyFieldInput };
};
