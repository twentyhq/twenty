import { Context } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { filtersScopedState } from '../states/filtersScopedState';

export function useRemoveFilter(context: Context<string | null>) {
  const [, setFilters] = useRecoilScopedState(filtersScopedState, context);

  return function removeFilter(filterField: string) {
    setFilters((filters) => {
      return filters.filter((filter) => {
        return filter.field !== filterField;
      });
    });
  };
}
