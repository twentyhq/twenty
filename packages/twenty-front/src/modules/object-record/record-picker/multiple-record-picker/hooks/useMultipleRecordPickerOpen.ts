import { multipleRecordPickerShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShowInitialLoadingComponentState';
import { multipleRecordPickerShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShowSkeletonComponentState';
import { useRecoilCallback } from 'recoil';

export const useMultipleRecordPickerOpen = () => {
  const openMultipleRecordPicker = useRecoilCallback(
    ({ set }) =>
      (recordPickerComponentInstanceId: string) => {
        set(
          multipleRecordPickerShowInitialLoadingComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        set(
          multipleRecordPickerShowSkeletonComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        setTimeout(() => {
          set(
            multipleRecordPickerShowInitialLoadingComponentState.atomFamily({
              instanceId: recordPickerComponentInstanceId,
            }),
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
