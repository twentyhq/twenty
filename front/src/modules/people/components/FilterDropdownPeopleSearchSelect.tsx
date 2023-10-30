import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

export const FilterDropdownPeopleSearchSelect = () => {
  const {
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilter();

  const peopleForSelect = useFilteredSearchPeopleQuery({
    searchFilter: objectFilterDropdownSearchInput,
    selectedIds: objectFilterDropdownSelectedEntityId
      ? [objectFilterDropdownSelectedEntityId]
      : [],
  });

  return (
    <ObjectFilterDropdownEntitySearchSelect
      entitiesForSelect={peopleForSelect}
    />
  );
};
