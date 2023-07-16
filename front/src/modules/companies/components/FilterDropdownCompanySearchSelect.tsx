import { FilterDropdownEntitySearchSelect } from '@/ui/filter-n-sort/components/FilterDropdownEntitySearchSelect';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/filter-n-sort/states/filterDropdownSelectedEntityIdScopedState';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';
import { TableContext } from '@/ui/table/states/TableContext';

import { useFilteredSearchCompanyQuery } from '../queries';

export function FilterDropdownCompanySearchSelect() {
  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  const [filterDropdownSelectedEntityId] = useRecoilScopedState(
    filterDropdownSelectedEntityIdScopedState,
    TableContext,
  );

  const usersForSelect = useFilteredSearchCompanyQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
  });

  return (
    <FilterDropdownEntitySearchSelect
      entitiesForSelect={usersForSelect}
      context={TableContext}
    />
  );
}
