import { useMemo } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeTableFiltersScopedState } from '../states/activeTableFiltersScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '../states/tableFilterDefinitionUsedInDropdownScopedState';

export function useActiveTableFilterCurrentlyEditedInDropdown() {
  const [activeTableFilters] = useRecoilScopedState(
    activeTableFiltersScopedState,
    TableContext,
  );

  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  return useMemo(() => {
    return activeTableFilters.find(
      (activeTableFilter) =>
        activeTableFilter.field === tableFilterDefinitionUsedInDropdown?.field,
    );
  }, [tableFilterDefinitionUsedInDropdown, activeTableFilters]);
}
