import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const SingleRecordPickerLoadingEffect = ({
  loading,
}: {
  loading: boolean;
}) => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const setSingleRecordPickerShouldShowSkeleton = useSetRecoilComponentStateV2(
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
