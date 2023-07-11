import { Context, useMemo } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export function useActiveFilterCurrentlyEditedInDropdown(
  context: Context<string | null>,
) {
  const [activeFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    context,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  return useMemo(() => {
    return activeFilters.find(
      (activeFilter) =>
        activeFilter.field === filterDefinitionUsedInDropdown?.field,
    );
  }, [filterDefinitionUsedInDropdown, activeFilters]);
}
