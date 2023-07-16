import { FilterDropdownEntitySearchSelect } from '@/lib/filters-and-sorts/components/FilterDropdownEntitySearchSelect';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSelectedEntityIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { TableContext } from '@/ui/tables/states/TableContext';

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
