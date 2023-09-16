import { useMemo } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filtersScopedState } from '../states/filtersScopedState';

import { useViewBarContext } from './useViewBarContext';

export const useFilterCurrentlyEdited = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filters] = useRecoilScopedState(
    filtersScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  return useMemo(() => {
    return filters.find(
      (filter) => filter.key === filterDefinitionUsedInDropdown?.key,
    );
  }, [filterDefinitionUsedInDropdown, filters]);
};
