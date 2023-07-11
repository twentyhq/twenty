import { Context } from 'react';
import { produce } from 'immer';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';
import { ActiveFilter } from '../types/ActiveFilter';

export function useUpsertActiveFilter(context: Context<string | null>) {
  const [, setActiveFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    context,
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
