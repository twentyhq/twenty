import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { useRecoilCallback } from 'recoil';

export const useMultipleRecordPickerOpen = () => {
  const openMultipleRecordPicker = useRecoilCallback(
    ({ set }) =>
      (recordPickerComponentInstanceId: string) => {
        set(
          multipleRecordPickerShouldShowInitialLoadingComponentState.atomFamily(
            {
              instanceId: recordPickerComponentInstanceId,
            },
          ),
          true,
        );
        set(
          multipleRecordPickerShouldShowSkeletonComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        setTimeout(() => {
          set(
            multipleRecordPickerShouldShowInitialLoadingComponentState.atomFamily(
              {
                instanceId: recordPickerComponentInstanceId,
              },
            ),
            false,
          );
        }, 100);
      },
    [],
  );

  return {
    openMultipleRecordPicker,
  };
};
