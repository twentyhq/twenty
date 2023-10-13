import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/Data/View Bar/components/FilterDropdownEntitySearchSelect';
import { useViewBarContext } from '@/ui/Data/View Bar/hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '@/ui/Data/View Bar/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/Data/View Bar/states/filterDropdownSelectedEntityIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

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
