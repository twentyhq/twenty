import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useDebouncedCallback } from 'use-debounce';

export const useSingleRecordPickerSearch = (
  recordPickerComponentInstanceIdFromProps?: string,
) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
      recordPickerComponentInstanceIdFromProps,
    );

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    recordPickerComponentInstanceId,
  );

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    recordPickerComponentInstanceId,
  );

  const debouncedSetSearchFilter = useDebouncedCallback(
    setSingleRecordPickerSearchFilter,
    100,
    {
      leading: true,
    },
  );

  const resetSearchFilter = () => {
    debouncedSetSearchFilter('');
    setSingleRecordPickerSelectedId(undefined);
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
