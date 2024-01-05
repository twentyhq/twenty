import debounce from 'lodash.debounce';

import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';

export const useEntitySelectSearch = () => {
  const {
    setRelationPickerPreselectedId,
    relationPickerSearchFilter,
    setRelationPickerSearchFilter,
  } = useRelationPicker({
    relationPickerScopeId: 'relation-picker',
  });

  const debouncedSetSearchFilter = debounce(
    setRelationPickerSearchFilter,
    100,
    {
      leading: true,
    },
  );

  const handleSearchFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    debouncedSetSearchFilter(event.currentTarget.value);
    setRelationPickerPreselectedId('');
  };

  return {
    searchFilter: relationPickerSearchFilter,
    handleSearchFilterChange,
  };
};
