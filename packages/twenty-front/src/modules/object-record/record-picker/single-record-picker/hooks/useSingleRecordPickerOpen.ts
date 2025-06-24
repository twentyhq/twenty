import { singleRecordPickerShowInitialLoadingComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShowInitialLoadingComponentState';
import { singleRecordPickerShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShowSkeletonComponentState';
import { useRecoilCallback } from 'recoil';

export const useSingleRecordPickerOpen = () => {
  const openRecordPicker = useRecoilCallback(
    ({ set }) =>
      (recordPickerComponentInstanceId: string) => {
        set(
          singleRecordPickerShowInitialLoadingComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        set(
          singleRecordPickerShowSkeletonComponentState.atomFamily({
            instanceId: recordPickerComponentInstanceId,
          }),
          true,
        );
        setTimeout(() => {
          set(
            singleRecordPickerShowInitialLoadingComponentState.atomFamily({
              instanceId: recordPickerComponentInstanceId,
            }),
            false,
          );
        }, 100);
      },
    [],
  );

  return {
    openRecordPicker,
  };
};
