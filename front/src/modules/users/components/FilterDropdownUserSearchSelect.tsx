import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { FilterDropdownEntitySearchSelect } from '@/ui/object/filter/components/FilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/filter/hooks/useFilter';
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
