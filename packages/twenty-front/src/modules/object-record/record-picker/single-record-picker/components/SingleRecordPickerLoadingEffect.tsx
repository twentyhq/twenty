import { singleRecordPickerShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShowSkeletonComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const SingleRecordPickerLoadingEffect = ({
  loading,
}: {
  loading: boolean;
}) => {
  const [previousLoading, setPreviousLoading] = useState(false);

  const setSingleRecordPickerShowSkeleton = useSetRecoilComponentStateV2(
    singleRecordPickerShowSkeletonComponentState,
  );

  const debouncedShowPickerSearchSkeleton = useDebouncedCallback(() => {
    setSingleRecordPickerShowSkeleton(true);
  }, 350);

  useEffect(() => {
    if (previousLoading !== loading) {
      setPreviousLoading(loading);

      if (loading) {
        debouncedShowPickerSearchSkeleton();
      } else {
        debouncedShowPickerSearchSkeleton.cancel();
        setSingleRecordPickerShowSkeleton(false);
      }
    }
  }, [
    loading,
    previousLoading,
    debouncedShowPickerSearchSkeleton,
    setSingleRecordPickerShowSkeleton,
  ]);

  return null;
};
