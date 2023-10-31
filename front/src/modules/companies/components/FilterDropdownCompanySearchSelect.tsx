import { FilterDropdownEntitySearchSelect } from '@/ui/object/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/filter/hooks/useFilter';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export const FilterDropdownCompanySearchSelect = () => {
  const { filterDropdownSearchInput, filterDropdownSelectedEntityId } =
    useFilter();

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
