import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { FilterDropdownEntitySearchSelect } from '@/ui/view-bar/components/FilterDropdownEntitySearchSelect';
import { useViewBarContext } from '@/ui/view-bar/hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/view-bar/states/filterDropdownSelectedEntityIdScopedState';

export const FilterDropdownPeopleSearchSelect = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDropdownSelectedEntityId] = useRecoilScopedState(
    filterDropdownSelectedEntityIdScopedState,
    ViewBarRecoilScopeContext,
  );

  const peopleForSelect = useFilteredSearchPeopleQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
  });

  return (
    <FilterDropdownEntitySearchSelect entitiesForSelect={peopleForSelect} />
  );
};
