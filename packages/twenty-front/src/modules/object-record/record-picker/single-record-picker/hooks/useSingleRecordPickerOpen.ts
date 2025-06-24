import { singleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowInitialLoadingComponentState';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';
import { useRecoilCallback } from 'recoil';

export const useSingleRecordPickerOpen = () => {
  const openSingleRecordPicker = useRecoilCallback(
    ({ set }) =>
      (recordPickerComponentInstanceId: string) => {
        set(
          singleRecordPickerShouldShowInitialLoadingComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        set(
          singleRecordPickerShouldShowSkeletonComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        setTimeout(() => {
          set(
            singleRecordPickerShouldShowInitialLoadingComponentState.atomFamily(
              {
                instanceId: recordPickerComponentInstanceId,
              },
            ),
            false,
          );
        }, 100);
      },
    [],
  );

  return {
    openSingleRecordPicker,
  };
};
