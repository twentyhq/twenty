import { type ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useCallback } from 'react';

type OpenActivityTargetCellEditModeProps = {
  recordPickerInstanceId: string;
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
};

// TODO: deprecate this once we are supporting one to many through relations
export const useOpenActivityTargetCellEditMode = () => {
  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openActivityTargetCellEditMode = useCallback(
    ({
      recordPickerInstanceId,
      activityTargetObjectRecords,
    }: OpenActivityTargetCellEditModeProps) => {
      const objectMetadataItems = jotaiStore
        .get(objectMetadataItemsState.atom)
        .filter(
          (objectMetadataItem) =>
            objectMetadataItem.isSearchable &&
            objectMetadataItem.isActive &&
            objectMetadataItem.nameSingular !== CoreObjectNameSingular.Task &&
            objectMetadataItem.nameSingular !== CoreObjectNameSingular.Note &&
            objectMetadataItem.nameSingular !==
              CoreObjectNameSingular.WorkspaceMember,
        );

      jotaiStore.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: recordPickerInstanceId,
        }),
        activityTargetObjectRecords.map((activityTargetObjectRecord) => ({
          recordId: activityTargetObjectRecord.targetObject.id,
          objectMetadataId:
            activityTargetObjectRecord.targetObjectMetadataItem.id,
          isSelected: true,
          isMatchingSearchFilter: true,
        })),
      );

      jotaiStore.set(
        multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
          {
            instanceId: recordPickerInstanceId,
          },
        ),
        objectMetadataItems,
      );

      jotaiStore.set(
        multipleRecordPickerSearchFilterComponentState.atomFamily({
          instanceId: recordPickerInstanceId,
        }),
        '',
      );

      openMultipleRecordPicker(recordPickerInstanceId);

      multipleRecordPickerPerformSearch({
        multipleRecordPickerInstanceId: recordPickerInstanceId,
        forceSearchFilter: '',
        forceSearchableObjectMetadataItems: objectMetadataItems,
        forcePickableMorphItems: activityTargetObjectRecords.map(
          (activityTargetObjectRecord) => ({
            recordId: activityTargetObjectRecord.targetObject.id,
            objectMetadataId:
              activityTargetObjectRecord.targetObjectMetadataItem.id,
            isSelected: true,
            isMatchingSearchFilter: true,
          }),
        ),
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
    [
      multipleRecordPickerPerformSearch,
      openMultipleRecordPicker,
      pushFocusItemToFocusStack,
    ],
  );

  return { openActivityTargetCellEditMode };
};
