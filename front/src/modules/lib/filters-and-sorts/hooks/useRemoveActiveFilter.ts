import { Context } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { activeFiltersScopedState } from '../states/activeFiltersScopedState';

export function useRemoveActiveFilter(context: Context<string | null>) {
  const [, setActiveFilters] = useRecoilScopedState(
    activeFiltersScopedState,
    context,
  );

  return function removeActiveFilter(filterField: string) {
    setActiveFilters((activeFilters) => {
      return activeFilters.filter((activeFilter) => {
        return activeFilter.field !== filterField;
      });
    });
  };
}
