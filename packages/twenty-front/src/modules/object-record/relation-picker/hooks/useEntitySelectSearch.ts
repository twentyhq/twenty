import { useDebouncedCallback } from 'use-debounce';

import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';

export const useEntitySelectSearch = ({
  relationPickerScopeId,
}: {
  relationPickerScopeId?: string;
} = {}) => {
  const {
    relationPickerSearchFilter,
    searchQuery,
    setRelationPickerPreselectedId,
    setRelationPickerSearchFilter,
  } = useRelationPicker({ relationPickerScopeId });

  const debouncedSetSearchFilter = useDebouncedCallback(
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
    searchQuery,
    handleSearchFilterChange,
  };
};
