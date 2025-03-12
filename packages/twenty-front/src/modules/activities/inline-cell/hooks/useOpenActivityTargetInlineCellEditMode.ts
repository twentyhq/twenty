import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilCallback } from 'recoil';

type OpenActivityTargetInlineCellEditModeProps = {
  recordPickerInstanceId: string;
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
};

export const useOpenActivityTargetInlineCellEditMode = () => {
  const { toggleClickOutsideListener: toggleRightDrawerClickOustideListener } =
    useClickOutsideListener(RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID);

  const { performSearch: multipleRecordPickerPerformSearch } =
    useMultipleRecordPickerPerformSearch();

  const openActivityTargetInlineCellEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        recordPickerInstanceId,
        activityTargetObjectRecords,
      }: OpenActivityTargetInlineCellEditModeProps) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue()
          .filter(
            (objectMetadataItem) =>
              objectMetadataItem.isSearchable &&
              objectMetadataItem.nameSingular !== CoreObjectNameSingular.Task &&
              objectMetadataItem.nameSingular !== CoreObjectNameSingular.Note,
          );

        set(
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

        set(
          multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
            {
              instanceId: recordPickerInstanceId,
            },
          ),
          objectMetadataItems,
        );

        set(
          multipleRecordPickerSearchFilterComponentState.atomFamily({
            instanceId: recordPickerInstanceId,
          }),
          '',
        );

        toggleRightDrawerClickOustideListener(false);

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
      },
    [multipleRecordPickerPerformSearch, toggleRightDrawerClickOustideListener],
  );

  return { openActivityTargetInlineCellEditMode };
};
