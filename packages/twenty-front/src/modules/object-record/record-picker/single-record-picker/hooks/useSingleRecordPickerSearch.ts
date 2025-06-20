import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDebouncedCallback } from 'use-debounce';

export const useSingleRecordPickerSearch = (
  recordPickerComponentInstanceIdFromProps?: string,
) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
      recordPickerComponentInstanceIdFromProps,
    );

  const setRecordPickerSearchFilter = useSetRecoilComponentStateV2(
    singleRecordPickerSearchFilterComponentState,
    recordPickerComponentInstanceId,
  );

  const setRecordPickerSelectedId = useSetRecoilComponentStateV2(
    singleRecordPickerSelectedIdComponentState,
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
    setRecordPickerSelectedId(undefined);
  };

  const handleSearchFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedSetSearchFilter(event.currentTarget.value);
  };

  return {
    handleSearchFilterChange,
    resetSearchFilter,
  };
};
