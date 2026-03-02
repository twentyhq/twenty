import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

export const useSingleRecordPickerOpen = () => {
  const store = useStore();
  const setInitialLoading = useCallback(
    (recordPickerComponentInstanceId: string, value: boolean) => {
      store.set(
        singleRecordPickerShouldShowInitialLoadingComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
        }),
        value,
      );
    },
    [store],
  );

  const openSingleRecordPicker = useCallback(
    (recordPickerComponentInstanceId: string) => {
      setInitialLoading(recordPickerComponentInstanceId, true);
      store.set(
        singleRecordPickerShouldShowSkeletonComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
        }),
        true,
      );
      setTimeout(() => {
        setInitialLoading(recordPickerComponentInstanceId, false);
      }, 100);
    },
    [setInitialLoading, store],
  );

  return {
    openSingleRecordPicker,
  };
};
