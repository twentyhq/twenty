import { useMemo } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export function useActiveTableFilterCurrentlyEditedInDropdown() {
  const [activeFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    TableContext,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  return useMemo(() => {
    return activeFilters.find(
      (activeFilter) =>
        activeFilter.field === filterDefinitionUsedInDropdown?.field,
    );
  }, [filterDefinitionUsedInDropdown, activeFilters]);
}
