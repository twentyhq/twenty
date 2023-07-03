import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { selectedFilterDropdownEntityIdScopedState } from '@/filters-and-sorts/states/selectedFilterDropdownEntityIdScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/recoil-scope/hooks/useRecoilScopedValue';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { SingleEntitySelectBase } from '@/relation-picker/components/SingleEntitySelectBase';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { Entity } from '@/relation-picker/types/EntityTypeForSelect';
import { TableContext } from '@/ui/tables/states/TableContext';
import { useSearchUserQuery } from '~/generated/graphql';

export function UserFilterDropdownSearchSelect() {
  const selectedDropdownSearchId =
    useRecoilScopedValue(
      selectedFilterDropdownEntityIdScopedState,
      TableContext,
    ) ?? '';

  const currentSearchFilter = useRecoilScopedValue(
    filterSearchInputScopedState,
    TableContext,
  );

  const [, setSelectedDropdownEntityId] = useRecoilScopedState(
    selectedFilterDropdownEntityIdScopedState,
    TableContext,
  );

  const usersForSelect = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    searchOnFields: ['displayName'],
    orderByField: 'displayName',
    selectedIds: [selectedDropdownSearchId],
    mappingFunction: (entity) => ({
      id: entity.id,
      entityType: Entity.User,
      name: `${entity.displayName}`,
      avatarType: 'rounded',
    }),
    searchFilter: currentSearchFilter,
  });

  function handleUserSelected(entity: EntityForSelect) {
    setSelectedDropdownEntityId(entity.id);
  }

  return (
    <>
      <SingleEntitySelectBase
        entities={{
          entitiesToSelect: usersForSelect.entitiesToSelect,
          selectedEntity: usersForSelect.selectedEntities[0],
        }}
        onEntitySelected={handleUserSelected}
      />
    </>
  );
}
