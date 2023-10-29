import { useEffect, useState } from 'react';

import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRemoveFilter } from '@/views/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/views/hooks/useUpsertFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { useFilter } from '../hooks/useFilter';

export const FilterDropdownEntitySearchSelect = ({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<EntityForSelect>;
}) => {
  const {
    filterDropdownSelectedEntityId,
    setFilterDropdownSelectedEntityId,
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    filterDropdownSearchInput,
    selectedFilter,
  } = useFilter();

  const [isAllEntitySelected, setIsAllEntitySelected] = useState(false);

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  const handleUserSelected = (
    selectedEntity: EntityForSelect | null | undefined,
  ) => {
    if (
      !filterDefinitionUsedInDropdown ||
      !selectedOperandInDropdown ||
      !selectedEntity
    ) {
      return;
    }

    if (isAllEntitySelected) {
      setIsAllEntitySelected(false);
    }

    const clickedOnAlreadySelectedEntity =
      selectedEntity.id === filterDropdownSelectedEntityId;

    if (clickedOnAlreadySelectedEntity) {
      removeFilter(filterDefinitionUsedInDropdown.fieldId);
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(selectedEntity.id);

      upsertFilter({
        displayValue: selectedEntity.name,
        fieldId: filterDefinitionUsedInDropdown.fieldId,
        operand: selectedOperandInDropdown,
        value: selectedEntity.id,
        displayAvatarUrl: selectedEntity.avatarUrl,
        definition: filterDefinitionUsedInDropdown,
      });
    }
  };

  const isAllEntitySelectShown =
    !!filterDefinitionUsedInDropdown?.selectAllLabel &&
    !!filterDefinitionUsedInDropdown?.SelectAllIcon &&
    (isAllEntitySelected ||
      filterDefinitionUsedInDropdown?.selectAllLabel
        .toLocaleLowerCase()
        .includes(filterDropdownSearchInput.toLocaleLowerCase()));

  const handleAllEntitySelectClick = () => {
    if (
      !filterDefinitionUsedInDropdown ||
      !selectedOperandInDropdown ||
      !filterDefinitionUsedInDropdown.selectAllLabel
    ) {
      return;
    }
    if (isAllEntitySelected) {
      setIsAllEntitySelected(false);

      removeFilter(filterDefinitionUsedInDropdown.fieldId);
    } else {
      setIsAllEntitySelected(true);

      setFilterDropdownSelectedEntityId(null);

      upsertFilter({
        displayValue: filterDefinitionUsedInDropdown.selectAllLabel,
        fieldId: filterDefinitionUsedInDropdown.fieldId,
        operand: ViewFilterOperand.IsNotNull,
        value: '',
        definition: filterDefinitionUsedInDropdown,
      });
    }
  };

  useEffect(() => {
    if (!selectedFilter) {
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(selectedFilter.value);
      setIsAllEntitySelected(
        selectedFilter.operand === ViewFilterOperand.IsNotNull,
      );
    }
  }, [
    selectedFilter,
    setFilterDropdownSelectedEntityId,
    entitiesForSelect.selectedEntities,
  ]);

  return (
    <>
      <SingleEntitySelectBase
        entitiesToSelect={entitiesForSelect.entitiesToSelect}
        selectedEntity={entitiesForSelect.selectedEntities[0]}
        loading={entitiesForSelect.loading}
        onEntitySelected={handleUserSelected}
        SelectAllIcon={filterDefinitionUsedInDropdown?.SelectAllIcon}
        selectAllLabel={filterDefinitionUsedInDropdown?.selectAllLabel}
        isAllEntitySelected={isAllEntitySelected}
        isAllEntitySelectShown={isAllEntitySelectShown}
        onAllEntitySelected={handleAllEntitySelectClick}
      />
    </>
  );
};
