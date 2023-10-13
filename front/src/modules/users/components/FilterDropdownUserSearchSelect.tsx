import { Context } from 'react';

import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/Data/View Bar/components/FilterDropdownEntitySearchSelect';
import { filterDropdownSearchInputScopedState } from '@/ui/Data/View Bar/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/Data/View Bar/states/filterDropdownSelectedEntityIdScopedState';
import { Entity } from '@/ui/Input/Relation Picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useSearchUserQuery } from '~/generated/graphql';

export const FilterDropdownUserSearchSelect = ({
  context,
}: {
  context: Context<string | null>;
}) => {
  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    context,
  );

  const [filterDropdownSelectedEntityId] = useRecoilScopedState(
    filterDropdownSelectedEntityIdScopedState,
    context,
  );

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
