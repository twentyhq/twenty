import { Context } from 'react';

import { useFilteredSearchPeopleQuery } from '@/people/hooks/useFilteredSearchPeopleQuery';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { FilterDropdownMultipleEntitySearchSelect } from '@/ui/view-bar/components/FilterDropdownMultipleEntitySearchSelect';
import { useFilterCurrentlyEdited } from '@/ui/view-bar/hooks/useFilterCurrentlyEdited';
import { filterDropdownSearchInputScopedState } from '@/ui/view-bar/states/filterDropdownSearchInputScopedState';

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

  const usersForSelect = useFilteredSearchPeopleQuery({
    searchFilter: filterDropdownSearchInput,
    selectedIds: filterCurrentlyEdited?.multipleValues ?? [],
  });

  if (usersForSelect.loading) return <DropdownMenuSkeletonItem />;

  return (
    <FilterDropdownMultipleEntitySearchSelect
      entitiesForSelect={usersForSelect}
    />
  );
};
