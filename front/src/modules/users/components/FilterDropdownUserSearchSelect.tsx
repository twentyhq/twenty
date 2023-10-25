import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/data/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useSearchUserQuery } from '~/generated/graphql';

export const FilterDropdownUserSearchSelect = () => {
  const { filterDropdownSearchInput, filterDropdownSelectedEntityId } =
    useFilter();

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: filterDropdownSearchInput,
      },
    ],
    orderByField: 'lastName',
    mappingFunction: (user) => ({
      id: user.id,
      entityType: Entity.User,
      name: `${user.displayName}`,
      avatarType: 'rounded',
      avatarUrl: user.avatarUrl ?? '',
      originalEntity: user,
    }),
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
  });

  return (
    <FilterDropdownEntitySearchSelect entitiesForSelect={usersForSelect} />
  );
};
