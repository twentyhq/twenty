import { Context } from 'react';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { FilterDropdownMultipleEntitySearchSelect } from '@/ui/view-bar/components/FilterDropdownMultipleEntitySearchSelect';
import { useFilterCurrentlyEdited } from '@/ui/view-bar/hooks/useFilterCurrentlyEdited';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';

import { useFilteredSearchUserQuery } from '../hooks/useFilteredSearchUserQuery';

export const FilterDropdownMultipleUserSearchSelect = ({
  context,
}: {
  context: Context<string | null>;
}) => {
  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    context,
  );

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

  const usersForSelect = useFilteredSearchUserQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterCurrentlyEdited?.multipleValues ?? [],
  });

  return (
    <FilterDropdownMultipleEntitySearchSelect
      entitiesForSelect={usersForSelect}
    />
  );
};
