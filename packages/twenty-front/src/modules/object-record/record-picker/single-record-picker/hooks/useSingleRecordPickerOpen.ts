import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useSingleRecordPickerOpen = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const setInitialLoading = useCallback(
    (recordPickerComponentInstanceId: string, value: boolean) => {
      store.set(
        singleRecordPickerShouldShowInitialLoadingComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
          surfaceId,
        }),
        value,
      );
    },
    [store, surfaceId],
  );

  const openSingleRecordPicker = useCallback(
    (recordPickerComponentInstanceId: string) => {
      setInitialLoading(recordPickerComponentInstanceId, true);
      store.set(
        singleRecordPickerShouldShowSkeletonComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
          surfaceId,
        }),
        true,
      );
      setTimeout(() => {
        setInitialLoading(recordPickerComponentInstanceId, false);
      }, 100);
    },
    [setInitialLoading, store, surfaceId],
  );

  return {
    openSingleRecordPicker,
  };
};
