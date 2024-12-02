import { useDebouncedCallback } from 'use-debounce';

import { useRecordPicker } from '@/object-record/relation-picker/hooks/useRecordPicker';

export const useRecordSelectSearch = ({
  recordPickerInstanceId,
}: {
  recordPickerInstanceId?: string;
} = {}) => {
  const { setRecordPickerSearchFilter, setRecordPickerPreselectedId } =
    useRecordPicker({ recordPickerInstanceId });

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
