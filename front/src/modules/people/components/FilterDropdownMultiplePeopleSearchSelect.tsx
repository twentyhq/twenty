import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { FilterDropdownMultipleEntitySearchSelect } from '@/ui/view-bar/components/FilterDropdownMultipleEntitySearchSelect';
import { useFilterCurrentlyEdited } from '@/ui/view-bar/hooks/useFilterCurrentlyEdited';
import { useViewBarContext } from '@/ui/view-bar/hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';

export const FilterDropdownMultiplePeopleSearchSelect = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  const peopleForSelect = useFilteredSearchPeopleQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterCurrentlyEdited?.multipleValues ?? [],
  });

  return (
    <FilterDropdownMultipleEntitySearchSelect
      entitiesForSelect={peopleForSelect}
    />
  );
};
