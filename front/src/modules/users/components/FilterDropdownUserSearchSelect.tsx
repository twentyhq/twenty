import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { selectedFilterDropdownEntityIdScopedState } from '@/filters-and-sorts/states/selectedFilterDropdownEntityIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { FilterDropdownEntitySearchSelect } from '@/ui/components/table/table-header/FilterDropdownEntitySearchSelect';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useSearchUserQuery } from '~/generated/graphql';

export function FilterDropdownUserSearchSelect() {
  const currentSearchFilter = useRecoilScopedValue(
    filterSearchInputScopedState,
    TableContext,
  );

  const [selectedDropdownEntityId] = useRecoilScopedState(
    selectedFilterDropdownEntityIdScopedState,
    TableContext,
  );

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    searchOnFields: ['displayName'],
    orderByField: 'displayName',
    selectedIds: [selectedDropdownEntityId ?? ''],
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: Entity.User,
      name: `${entity.displayName}`,
      avatarType: 'rounded',
    }),
    searchFilter: currentSearchFilter,
  });

  return (
    <FilterDropdownEntitySearchSelect entitiesForSelect={usersForSelect} />
  );
}
