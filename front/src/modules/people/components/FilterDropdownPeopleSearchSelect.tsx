import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/data/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';

export const FilterDropdownPeopleSearchSelect = () => {
  const { filterDropdownSearchInput, filterDropdownSelectedEntityId } =
    useFilter();

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
