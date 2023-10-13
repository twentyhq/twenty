import { useContext } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { ViewBarContext } from '../contexts/ViewBarContext';
import { filtersScopedState } from '../states/filtersScopedState';

export const useRemoveFilter = () => {
  const { ViewBarRecoilScopeContext } = useContext(ViewBarContext);

  const [, setFilters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const removeFilter = (filterKey: string) => {
    setFilters((filters) => {
      return filters.filter((filter) => {
        return filter.key !== filterKey;
      });
    });
  };

  return removeFilter;
};
