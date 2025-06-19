import { singleRecordPickerShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShowInitialLoadingComponentState';
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
  const [initialized, setInitialized] = useState(false);

  const setSingleRecordPickerShowSkeleton = useSetRecoilComponentStateV2(
    singleRecordPickerShowSkeletonComponentState,
  );

  const setSingleRecordPickerShowInitialLoading = useSetRecoilComponentStateV2(
    singleRecordPickerShowInitialLoadingComponentState,
  );

  const debouncedShowPickerSearchSkeleton = useDebouncedCallback(
    () => setSingleRecordPickerShowSkeleton(true),
    350,
  );

  const debouncedInitialShowPickerSearchSkeleton = useDebouncedCallback(() => {
    setSingleRecordPickerShowSkeleton(true);
    setSingleRecordPickerShowInitialLoading(false);
  }, 100);

  useEffect(() => {
    if (previousLoading !== loading) {
      setPreviousLoading(loading);

      if (!initialized) {
        setSingleRecordPickerShowInitialLoading(true);
        debouncedInitialShowPickerSearchSkeleton();
        setInitialized(true);
        return;
      } else {
        setSingleRecordPickerShowInitialLoading(false);
      }

      if (loading) {
        debouncedShowPickerSearchSkeleton();
      } else {
        debouncedInitialShowPickerSearchSkeleton.cancel();
        debouncedShowPickerSearchSkeleton.cancel();
        setSingleRecordPickerShowSkeleton(false);
      }
    }
  }, [
    initialized,
    loading,
    previousLoading,
    debouncedShowPickerSearchSkeleton,
    setSingleRecordPickerShowSkeleton,
    setSingleRecordPickerShowInitialLoading,
    debouncedInitialShowPickerSearchSkeleton,
  ]);

  return null;
};
