import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

export const useMultipleRecordPickerOpen = () => {
  const setInitialLoading = useRecoilCallback(
    ({ set }) =>
      (recordPickerComponentInstanceId: string, value: boolean) => {
        set(
          multipleRecordPickerShouldShowInitialLoadingComponentState.atomFamily(
            {
              instanceId: recordPickerComponentInstanceId,
            },
          ),
          value,
        );
      },
    [],
  );

  const openMultipleRecordPicker = useCallback(
    (recordPickerComponentInstanceId: string) => {
      setInitialLoading(recordPickerComponentInstanceId, true);
      jotaiStore.set(
        multipleRecordPickerShouldShowSkeletonComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
        }),
        true,
      );
      setTimeout(() => {
        setInitialLoading(recordPickerComponentInstanceId, false);
      }, 100);
    },
    [setInitialLoading],
  );

  return {
    openMultipleRecordPicker,
  };
};
