import { useEffect } from 'react';

import { useFilterCurrentlyEdited } from '@/ui/filter-n-sort/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '@/ui/filter-n-sort/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/ui/filter-n-sort/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/filter-n-sort/states/filterDropdownSelectedEntityIdScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { EntitiesForMultipleEntitySelect } from '@/ui/relation-picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/ui/relation-picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';

export function FilterDropdownEntitySearchSelect({
  entitiesForSelect,
  context,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<EntityForSelect>;
  context: React.Context<string | null>;
}) {
  const [filterDropdownSelectedEntityId, setFilterDropdownSelectedEntityId] =
    useRecoilScopedState(filterDropdownSelectedEntityIdScopedState, context);

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const upsertFilter = useUpsertFilter(context);
  const removeFilter = useRemoveFilter(context);

  const filterCurrentlyEdited = useFilterCurrentlyEdited(context);

  function handleUserSelected(selectedEntity: EntityForSelect) {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) {
      return;
    }

    const clickedOnAlreadySelectedEntity =
      selectedEntity.id === filterDropdownSelectedEntityId;

    if (clickedOnAlreadySelectedEntity) {
      removeFilter(filterDefinitionUsedInDropdown.field);
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(selectedEntity.id);

      upsertFilter({
        displayValue: selectedEntity.name,
        field: filterDefinitionUsedInDropdown.field,
        operand: selectedOperandInDropdown,
        type: filterDefinitionUsedInDropdown.type,
        value: selectedEntity.id,
      });
    }
  }

  useEffect(() => {
    if (!filterCurrentlyEdited) {
      setFilterDropdownSelectedEntityId(null);
    }
  }, [filterCurrentlyEdited, setFilterDropdownSelectedEntityId]);

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
