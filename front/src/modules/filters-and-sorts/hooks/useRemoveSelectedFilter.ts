import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { selectedFiltersScopedState } from '../states/selectedFiltersScopedState';

export function useRemoveSelectedFilter() {
  const [, setSelectedFilters] = useRecoilScopedState(
    selectedFiltersScopedState,
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
