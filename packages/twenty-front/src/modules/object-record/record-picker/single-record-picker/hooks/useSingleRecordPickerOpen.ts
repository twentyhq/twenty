import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

export const useSingleRecordPickerOpen = () => {
  const setInitialLoading = useCallback(
    (recordPickerComponentInstanceId: string, value: boolean) => {
      jotaiStore.set(
        singleRecordPickerShouldShowInitialLoadingComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
        }),
        value,
      );
    },
    [],
  );

  const openSingleRecordPicker = useCallback(
    (recordPickerComponentInstanceId: string) => {
      setInitialLoading(recordPickerComponentInstanceId, true);
      jotaiStore.set(
        singleRecordPickerShouldShowSkeletonComponentState.atomFamily({
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
    openSingleRecordPicker,
  };
};
