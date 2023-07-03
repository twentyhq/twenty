import { useMemo } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { selectedFilterInDropdownScopedState } from '../states/selectedFilterInDropdownScopedState';
import { selectedTableFiltersScopedState } from '../states/selectedTableFiltersScopedState';

export function useSelectedFilterCurrentlyEditedInDropdown() {
  const [selectedFilters] = useRecoilScopedState(
    selectedTableFiltersScopedState,
    TableContext,
  );

  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  return useMemo(() => {
    return selectedFilters.find(
      (selectedFilter) =>
        selectedFilter.field === selectedFilterInDropdown?.field,
    );
  }, [selectedFilterInDropdown, selectedFilters]);
}
