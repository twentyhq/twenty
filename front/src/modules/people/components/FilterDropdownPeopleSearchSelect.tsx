import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/object/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/filter/hooks/useFilter';

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
