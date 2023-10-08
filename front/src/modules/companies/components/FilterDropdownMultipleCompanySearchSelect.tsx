import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { FilterDropdownMultipleEntitySearchSelect } from '@/ui/view-bar/components/FilterDropdownMultipleEntitySearchSelect';
import { useFilterCurrentlyEdited } from '@/ui/view-bar/hooks/useFilterCurrentlyEdited';
import { useViewBarContext } from '@/ui/view-bar/hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export const FilterDropdownMultipleCompanySearchSelect = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  const companiesForSelect = useFilteredSearchCompanyQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterCurrentlyEdited?.multipleValues ?? [],
  });

  return (
    <FilterDropdownMultipleEntitySearchSelect
      entitiesForSelect={companiesForSelect}
    />
  );
};
