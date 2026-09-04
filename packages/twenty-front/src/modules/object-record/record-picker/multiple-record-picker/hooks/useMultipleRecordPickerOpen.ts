import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useMultipleRecordPickerOpen = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const setInitialLoading = useCallback(
    (recordPickerComponentInstanceId: string, value: boolean) => {
      store.set(
        multipleRecordPickerShouldShowInitialLoadingComponentState.atomFamily({
          instanceId: recordPickerComponentInstanceId,
          surfaceId,
        }),
        value,
      );
    },
    [store, surfaceId],
  );

  const openMultipleRecordPicker = useCallback(
    (recordPickerComponentInstanceId: string) => {
      setInitialLoading(recordPickerComponentInstanceId, true);
      store.set(
        multipleRecordPickerShouldShowSkeletonComponentState.atomFamily({
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
    openMultipleRecordPicker,
  };
};
