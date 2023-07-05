import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeTableFiltersScopedState } from '../states/activeTableFiltersScopedState';

export function useRemoveActiveTableFilter() {
  const [, setActiveTableFilters] = useRecoilScopedState(
    activeTableFiltersScopedState,
    TableContext,
  );

  return function removeActiveTableFilter(filterField: string) {
    setActiveTableFilters((activeTableFilters) => {
      return activeTableFilters.filter((activeTableFilter) => {
        return activeTableFilter.field !== filterField;
      });
    });
  };
}
