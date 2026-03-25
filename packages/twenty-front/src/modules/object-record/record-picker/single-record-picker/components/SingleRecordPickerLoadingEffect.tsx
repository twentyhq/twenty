import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const SingleRecordPickerLoadingEffect = ({
  loading,
}: {
  loading: boolean;
}) => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const setSingleRecordPickerShouldShowSkeleton = useSetAtomComponentState(
    singleRecordPickerShouldShowSkeletonComponentState,
  );

  const debouncedShowPickerSearchSkeleton = useDebouncedCallback(() => {
    setSingleRecordPickerShouldShowSkeleton(true);
  }, 350);

  useEffect(() => {
    if (previousLoading !== loading) {
      setPreviousLoading(loading);

      if (loading) {
        debouncedShowPickerSearchSkeleton();
      } else {
        debouncedShowPickerSearchSkeleton.cancel();
        setSingleRecordPickerShouldShowSkeleton(false);
      }
    }
  }, [
    loading,
    previousLoading,
    debouncedShowPickerSearchSkeleton,
    setSingleRecordPickerShouldShowSkeleton,
  ]);

  return null;
};
