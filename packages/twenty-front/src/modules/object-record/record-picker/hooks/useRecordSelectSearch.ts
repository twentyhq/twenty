import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerPreselectedIdComponentState } from '@/object-record/record-picker/states/recordPickerPreselectedIdComponentState';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDebouncedCallback } from 'use-debounce';

export const useRecordSelectSearch = (
  recordPickerComponentInstanceIdFromProps?: string,
) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      RecordPickerComponentInstanceContext,
      recordPickerComponentInstanceIdFromProps,
    );

  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    recordPickerSearchFilterComponentState,
    recordPickerComponentInstanceId,
  );

  const setRecordPickerPreselectedId = useSetRecoilComponentStateV2(
    recordPickerPreselectedIdComponentState,
    recordPickerComponentInstanceId,
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
