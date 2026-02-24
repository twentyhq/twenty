import { multipleRecordPickerIsFetchingMoreComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsFetchingMoreComponentState';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerLoadingEffect = () => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const loading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
  );

  const setMultipleRecordPickerShowSkeleton = useSetRecoilComponentStateV2(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );

  const [multipleRecordPickerIsFetchingMore] = useRecoilComponentState(
    multipleRecordPickerIsFetchingMoreComponentState,
  );

  const debouncedShowPickerSearchSkeleton = useDebouncedCallback(
    () => setMultipleRecordPickerShowSkeleton(true),
    350,
  );

  useEffect(() => {
    if (previousLoading !== loading) {
      setPreviousLoading(loading);

      if (loading) {
        if (!multipleRecordPickerIsFetchingMore) {
          debouncedShowPickerSearchSkeleton();
        }
      } else {
        debouncedShowPickerSearchSkeleton.cancel();
        setMultipleRecordPickerShowSkeleton(false);
      }
    }
  }, [
    loading,
    previousLoading,
    setMultipleRecordPickerShowSkeleton,
    multipleRecordPickerIsFetchingMore,
    debouncedShowPickerSearchSkeleton,
  ]);

  return null;
};
