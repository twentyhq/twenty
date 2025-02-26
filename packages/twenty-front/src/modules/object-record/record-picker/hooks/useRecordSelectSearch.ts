import { recordPickerPreselectedIdComponentState } from '@/object-record/record-picker/states/recordPickerPreselectedIdComponentState';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDebouncedCallback } from 'use-debounce';

export const useRecordSelectSearch = ({
  recordPickerInstanceId,
}: {
  recordPickerInstanceId?: string;
} = {}) => {
  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    recordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  const setRecordPickerPreselectedId = useSetRecoilComponentStateV2(
    recordPickerPreselectedIdComponentState,
    recordPickerInstanceId,
  );
  const debouncedSetSearchFilter = useDebouncedCallback(
    setRecordPickerSearchFilter,
    100,
    {
      leading: true,
    },
  );

  const resetSearchFilter = () => {
    debouncedSetSearchFilter('');
    setRecordPickerPreselectedId('');
  };

  const handleSearchFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedSetSearchFilter(event.currentTarget.value);
    setRecordPickerPreselectedId('');
  };

  return {
    handleSearchFilterChange,
    resetSearchFilter,
  };
};
