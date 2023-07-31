import { Context, useMemo } from 'react';

import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filtersScopedState } from '../states/filtersScopedState';

export function useFilterCurrentlyEdited(context: Context<string | null>) {
  const [filters] = useRecoilScopedState(filtersScopedState, context);

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  return useMemo(() => {
    return filters.find(
      (filter) => filter.field === filterDefinitionUsedInDropdown?.field,
    );
  }, [filterDefinitionUsedInDropdown, filters]);
}
