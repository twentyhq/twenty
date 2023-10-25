import { FilterDropdownEntitySearchSelect } from '@/ui/data/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';

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
