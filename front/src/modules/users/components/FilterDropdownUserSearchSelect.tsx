import { Context, useEffect } from 'react';

import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { FilterDropdownEntitySearchSelect } from '@/ui/filter-n-sort/components/FilterDropdownEntitySearchSelect';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/filter-n-sort/states/filterDropdownSelectedEntityIdScopedState';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useSearchUserQuery } from '~/generated/graphql';

export function FilterDropdownUserSearchSelect({
  context,
}: {
  context: Context<string | null>;
}) {
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
    searchOnFields: ['firstName', 'lastName'],
    orderByField: 'lastName',
    selectedIds: filterDropdownSelectedEntityId
      ? [filterDropdownSelectedEntityId]
      : [],
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: Entity.User,
      name: `${entity.displayName}`,
      avatarType: 'rounded',
      avatarUrl: entity.avatarUrl ?? '',
    }),
    searchFilter: filterDropdownSearchInput,
  });

  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    setHotkeyScope(RelationPickerHotkeyScope.RelationPicker);
  });

  return (
    <FilterDropdownEntitySearchSelect
      entitiesForSelect={usersForSelect}
      context={context}
    />
  );
}
