import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedFilterDropdownEntityIdScopedState } from '@/filters-and-sorts/states/selectedFilterDropdownEntityIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { FilterDropdownEntitySearchSelect } from '@/ui/components/table/table-header/FilterDropdownEntitySearchSelect';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useSearchCompanyQuery } from '~/generated/graphql';

export function FilterDropdownCompanySearchSelect() {
  const filterDropdownSearchInput = useRecoilScopedValue(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  const [selectedDropdownEntityId] = useRecoilScopedState(
    selectedFilterDropdownEntityIdScopedState,
    TableContext,
  );

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: [selectedDropdownEntityId ?? ''],
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: Entity.User,
      name: `${entity.name}`,
      avatarType: 'rounded',
    }),
    searchFilter: filterDropdownSearchInput,
  });

  return (
    <FilterDropdownEntitySearchSelect entitiesForSelect={usersForSelect} />
  );
}
