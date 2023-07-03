import { useEffect } from 'react';

import { useRemoveSelectedFilter } from '@/filters-and-sorts/hooks/useRemoveSelectedFilter';
import { useSelectedFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useSelectedFilterCurrentlyEditedInDropdown';
import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { selectedFilterDropdownEntityIdScopedState } from '@/filters-and-sorts/states/selectedFilterDropdownEntityIdScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
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
  const [selectedDropdownEntityId, setSelectedDropdownEntityId] =
    useRecoilScopedState(
      selectedFilterDropdownEntityIdScopedState,
      TableContext,
    );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const upsertSelectedFilter = useUpsertSelectedFilter();
  const removeSelectedFilter = useRemoveSelectedFilter();

  const selectedFilterCurrentlyEditedInDropdown =
    useSelectedFilterCurrentlyEditedInDropdown();

  function handleUserSelected(entity: EntityForSelect) {
    if (!selectedFilterInDropdown || !selectedOperandInDropdown) {
      return;
    }

    if (entity.id === selectedDropdownEntityId) {
      removeSelectedFilter(selectedFilterInDropdown.field);
      setSelectedDropdownEntityId(null);
    } else {
      setSelectedDropdownEntityId(entity.id);

      upsertSelectedFilter({
        displayValue: entity.name,
        field: selectedFilterInDropdown.field,
        operand: selectedOperandInDropdown,
        type: selectedFilterInDropdown.type,
        value: entity.id,
      });
    }
  }

  useEffect(() => {
    if (!selectedFilterCurrentlyEditedInDropdown) {
      setSelectedDropdownEntityId(null);
    }
  }, [selectedFilterCurrentlyEditedInDropdown, setSelectedDropdownEntityId]);

  return (
    <>
      <SingleEntitySelectBase
        entities={{
          entitiesToSelect: entitiesForSelect.entitiesToSelect,
          selectedEntity: entitiesForSelect.selectedEntities[0],
        }}
        onEntitySelected={handleUserSelected}
      />
    </>
  );
}
