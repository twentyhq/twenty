import { produce } from 'immer';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';
import { ActiveFilter } from '../types/ActiveFilter';

export function useUpsertActiveFilter() {
  const [, setActiveFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    TableContext,
  );

  return function upsertActiveFilter(activeFilterToUpsert: ActiveFilter) {
    setActiveFilters((activeFilters) => {
      return produce(activeFilters, (activeFiltersDraft) => {
        const index = activeFiltersDraft.findIndex(
          (activeFilter) => activeFilter.field === activeFilterToUpsert.field,
        );

        if (index === -1) {
          activeFiltersDraft.push(activeFilterToUpsert);
        } else {
          activeFiltersDraft[index] = activeFilterToUpsert;
        }
      });
    });
  };
}
