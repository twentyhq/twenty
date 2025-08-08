import { multipleRecordPickerIsFetchingMoreComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsFetchingMoreComponentState';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerLoadingEffect = () => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const loading = useRecoilComponentValue(
    multipleRecordPickerIsLoadingComponentState,
  );

  const setMultipleRecordPickerShowSkeleton = useSetRecoilComponentState(
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
