import { produce } from 'immer';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { selectedTableFiltersScopedState } from '../states/selectedTableFiltersScopedState';
import { SelectedEntityFilter } from '../types/SelectedEntityFilter';

export function useUpsertSelectedFilter() {
  const [, setSelectedFilters] = useRecoilScopedState(
    selectedTableFiltersScopedState,
    TableContext,
  );

  return function upsertSelectedFilter(
    newSelectedFilter: SelectedEntityFilter,
  ) {
    setSelectedFilters((selectedFilters) => {
      return produce(selectedFilters, (selectedFiltersDraft) => {
        const index = selectedFiltersDraft.findIndex(
          (selectedFilter) => selectedFilter.field === newSelectedFilter.field,
        );

        if (index === -1) {
          selectedFiltersDraft.push(newSelectedFilter);
        } else {
          selectedFiltersDraft[index] = newSelectedFilter;
        }
      });
    });
  };
}
