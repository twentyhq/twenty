import { produce } from 'immer';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

import { activeTableFiltersScopedState } from '../states/activeTableFiltersScopedState';
import { ActiveTableFilter } from '../types/ActiveTableFilter';

export function useUpsertActiveTableFilter() {
  const [, setActiveTableFilters] = useRecoilScopedState(
    activeTableFiltersScopedState,
    TableContext,
  );

  return function upsertActiveTableFilter(
    activeTableFilterToUpsert: ActiveTableFilter,
  ) {
    setActiveTableFilters((activeTableFilters) => {
      return produce(activeTableFilters, (activeTableFiltersDraft) => {
        const index = activeTableFiltersDraft.findIndex(
          (activeTableFilter) =>
            activeTableFilter.field === activeTableFilterToUpsert.field,
        );

        if (index === -1) {
          activeTableFiltersDraft.push(activeTableFilterToUpsert);
        } else {
          activeTableFiltersDraft[index] = activeTableFilterToUpsert;
        }
      });
    });
  };
}
