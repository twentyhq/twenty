import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';

export function useRemoveActiveFilter() {
  const [, setActiveFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    TableContext,
  );

  return function removeActiveFilter(filterField: string) {
    setActiveFilters((activeFilters) => {
      return activeFilters.filter((activeFilter) => {
        return activeFilter.field !== filterField;
      });
    });
  };
}
