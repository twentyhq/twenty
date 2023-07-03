import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { selectedTableFiltersScopedState } from '../states/selectedTableFiltersScopedState';

export function useRemoveSelectedFilter() {
  const [, setSelectedFilters] = useRecoilScopedState(
    selectedTableFiltersScopedState,
    TableContext,
  );

  return function removeSelectedFilter(filterField: string) {
    setSelectedFilters((selectedFilters) => {
      return selectedFilters.filter((selectedFilter) => {
        return selectedFilter.field !== filterField;
      });
    });
  };
}
