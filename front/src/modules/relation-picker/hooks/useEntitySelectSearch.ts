import debounce from 'lodash.debounce';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { relationPickerHoverIndexScopedState } from '../states/relationPickerHoverIndexScopedState';
import { relationPickerSearchFilterScopedState } from '../states/relationPickerSearchFilterScopedState';

export function useEntitySelectSearch() {
  const [, setHoveredIndex] = useRecoilScopedState(
    relationPickerHoverIndexScopedState,
  );

  const [searchFilter, setSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const debouncedSetSearchFilter = debounce(setSearchFilter, 100, {
    leading: true,
  });

  function handleSearchFilterChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    debouncedSetSearchFilter(event.currentTarget.value);
    setHoveredIndex(0);
  }

  return {
    searchFilter,
    handleSearchFilterChange,
  };
}
