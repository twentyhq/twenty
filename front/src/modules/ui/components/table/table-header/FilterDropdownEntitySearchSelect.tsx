import { useEffect } from 'react';

import { useFilterCurrentlyEdited } from '@/lib/filters-and-sorts/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSelectedEntityIdScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
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
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertFilter(TableContext);
  const removeActiveTableFilter = useRemoveFilter(TableContext);

  const filterCurrentlyEdited =
    useFilterCurrentlyEdited(TableContext);

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
    if (!filterCurrentlyEdited) {
      setFilterDropdownSelectedEntityId(null);
    }
  }, [
    filterCurrentlyEdited,
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
