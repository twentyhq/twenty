import { Context } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { filtersScopedState } from '../states/filtersScopedState';

export const useRemoveFilter = (context: Context<string | null>) => {
  const [, setFilters] = useRecoilScopedState(filtersScopedState, context);

  const removeFilter = (filterKey: string) => {
    setFilters((filters) => {
      return filters.filter((filter) => {
        return filter.key !== filterKey;
      });
    });
  };

  return removeFilter;
};
