import { FilterDropdownEntitySearchSelect } from '@/ui/data/view-bar/components/FilterDropdownEntitySearchSelect';
import { useViewBarContext } from '@/ui/data/view-bar/hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '@/ui/data/view-bar/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/data/view-bar/states/filterDropdownSelectedEntityIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export const FilterDropdownCompanySearchSelect = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDropdownSelectedEntityId] = useRecoilScopedState(
    filterDropdownSelectedEntityIdScopedState,
    ViewBarRecoilScopeContext,
  );

  const usersForSelect = useFilteredSearchCompanyQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
  });

  return (
    <FilterDropdownEntitySearchSelect entitiesForSelect={usersForSelect} />
  );
};
