import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export const FilterDropdownCompanySearchSelect = () => {
  const {
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilter();

  const usersForSelect = useFilteredSearchCompanyQuery({
    searchFilter: objectFilterDropdownSearchInput,
    selectedIds: objectFilterDropdownSelectedEntityId
      ? [objectFilterDropdownSelectedEntityId]
      : [],
  });

  return (
    <ObjectFilterDropdownEntitySearchSelect
      entitiesForSelect={usersForSelect}
    />
  );
};
