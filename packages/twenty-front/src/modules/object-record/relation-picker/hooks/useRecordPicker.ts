import { recordPickerPreselectedIdComponentState } from '@/object-record/relation-picker/states/recordPickerPreselectedIdComponentState';
import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useRecordPicker = ({
  recordPickerInstanceId,
}: {
  recordPickerInstanceId?: string;
}) => {
  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    recordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  const setRecordPickerPreselectedId = useSetRecoilComponentStateV2(
    recordPickerPreselectedIdComponentState,
    recordPickerInstanceId,
  );

  return {
    setRecordPickerSearchFilter,
    setRecordPickerPreselectedId,
  };
};
