import { multipleRecordPickerIsFetchingMoreComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsFetchingMoreComponentState';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const MultipleRecordPickerLoadingEffect = () => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const loading = useAtomComponentStateValue(
    multipleRecordPickerIsLoadingComponentState,
  );

  const setMultipleRecordPickerShowSkeleton = useSetAtomComponentState(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );

  const [multipleRecordPickerIsFetchingMore] = useAtomComponentState(
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
