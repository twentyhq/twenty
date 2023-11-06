import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { useSearchUserQuery } from '~/generated/graphql';

export const FilterDropdownUserSearchSelect = () => {
  const {
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilter();

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: objectFilterDropdownSearchInput,
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
