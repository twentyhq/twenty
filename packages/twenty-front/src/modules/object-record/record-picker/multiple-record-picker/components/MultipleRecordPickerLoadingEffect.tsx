import { multipleRecordPickerIsFetchingMoreComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsFetchingMoreComponentState';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShowInitialLoadingComponentState';
import { multipleRecordPickerShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShowSkeletonComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerLoadingEffect = () => {
  const [previousLoading, setPreviousLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
  );

  const setMultipleRecordPickerShowInitialLoading =
    useSetRecoilComponentStateV2(
      multipleRecordPickerShowInitialLoadingComponentState,
    );

  const setMultipleRecordPickerShowSkeleton = useSetRecoilComponentStateV2(
    multipleRecordPickerShowSkeletonComponentState,
  );

  const [multipleRecordPickerIsFetchingMore] = useRecoilComponentStateV2(
    multipleRecordPickerIsFetchingMoreComponentState,
  );

  const setIsReloadingDebounced = useDebouncedCallback(
    () => setMultipleRecordPickerShowSkeleton(true),
    350,
  );

  const setIsFetchingInitiallyDebounced = useDebouncedCallback(() => {
    setMultipleRecordPickerShowSkeleton(true);
    setMultipleRecordPickerShowInitialLoading(false);
  }, 100);

  useEffect(() => {
    if (previousLoading !== loading) {
      setPreviousLoading(loading);

      if (!initialized) {
        setMultipleRecordPickerShowInitialLoading(true);
        setIsFetchingInitiallyDebounced();
        setInitialized(true);
        return;
      } else {
        setMultipleRecordPickerShowInitialLoading(false);
      }

      if (loading) {
        if (!multipleRecordPickerIsFetchingMore) {
          setIsReloadingDebounced();
        }
      } else {
        setIsReloadingDebounced.cancel();
        setIsFetchingInitiallyDebounced.cancel();
        setMultipleRecordPickerShowSkeleton(false);
      }
    }
  }, [
    initialized,
    loading,
    previousLoading,
    setIsReloadingDebounced,
    setIsFetchingInitiallyDebounced,
    setMultipleRecordPickerShowSkeleton,
    setMultipleRecordPickerShowInitialLoading,
    multipleRecordPickerIsFetchingMore,
  ]);

  return null;
};
