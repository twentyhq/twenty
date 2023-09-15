import { useContext } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { ViewBarContext } from '../contexts/ViewBarContext';
import { filtersScopedState } from '../states/filtersScopedState';

export function useRemoveFilter() {
  const { ViewBarRecoilScopeContext } = useContext(ViewBarContext);

  const [, setFilters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  return function removeFilter(filterKey: string) {
    setFilters((filters) => {
      return filters.filter((filter) => {
        return filter.key !== filterKey;
      });
    });
  };
}
