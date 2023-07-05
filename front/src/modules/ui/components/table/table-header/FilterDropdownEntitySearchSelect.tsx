import { useEffect } from 'react';

import { useActiveTableFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useActiveFilterCurrentlyEditedInDropdown';
import { useRemoveActiveTableFilter } from '@/filters-and-sorts/hooks/useRemoveActiveTableFilter';
import { useUpsertActiveTableFilter } from '@/filters-and-sorts/hooks/useUpsertActiveTableFilter';
import { filterDropdownSelectedEntityIdScopedState } from '@/filters-and-sorts/states/filterDropdownSelectedEntityIdScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { EntitiesForMultipleEntitySelect } from '@/relation-picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/relation-picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownEntitySearchSelect({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<EntityForSelect>;
}) {
  const [filterDropdownSelectedEntityId, setFilterDropdownSelectedEntityId] =
    useRecoilScopedState(
      filterDropdownSelectedEntityIdScopedState,
      TableContext,
    );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertActiveTableFilter();
  const removeActiveTableFilter = useRemoveActiveTableFilter();

  const activeFilterCurrentlyEditedInDropdown =
    useActiveTableFilterCurrentlyEditedInDropdown();

  function handleUserSelected(selectedEntity: EntityForSelect) {
    if (!tableFilterDefinitionUsedInDropdown || !selectedOperandInDropdown) {
      return;
    }

    const clickedOnAlreadySelectedEntity =
      selectedEntity.id === filterDropdownSelectedEntityId;

    if (clickedOnAlreadySelectedEntity) {
      removeActiveTableFilter(tableFilterDefinitionUsedInDropdown.field);
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(selectedEntity.id);

      upsertActiveTableFilter({
        displayValue: selectedEntity.name,
        field: tableFilterDefinitionUsedInDropdown.field,
        operand: selectedOperandInDropdown,
        type: tableFilterDefinitionUsedInDropdown.type,
        value: selectedEntity.id,
      });
    }
  }

  useEffect(() => {
    if (!activeFilterCurrentlyEditedInDropdown) {
      setFilterDropdownSelectedEntityId(null);
    }
  }, [
    activeFilterCurrentlyEditedInDropdown,
    setFilterDropdownSelectedEntityId,
  ]);

  return (
    <>
      <SingleEntitySelectBase
        entities={{
          entitiesToSelect: entitiesForSelect.entitiesToSelect,
          selectedEntity: entitiesForSelect.selectedEntities[0],
          loading: entitiesForSelect.loading,
        }}
        onEntitySelected={handleUserSelected}
      />
    </>
  );
}
