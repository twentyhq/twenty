import { useEffect, useState } from 'react';

import { useFilterCurrentlyEdited } from '@/ui/data/filter/hooks/useFilterCurrentlyEdited';
import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRemoveFilter } from '@/views/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/views/hooks/useUpsertFilter';
import { ViewFilterOperand } from '~/generated/graphql';

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
  } = useFilter();

  const [isAllEntitySelected, setIsAllEntitySelected] = useState(false);

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  const filterCurrentlyEdited = useFilterCurrentlyEdited();

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
      removeFilter(filterDefinitionUsedInDropdown.key);
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(selectedEntity.id);

      upsertFilter({
        displayValue: selectedEntity.name,
        key: filterDefinitionUsedInDropdown.key,
        operand: selectedOperandInDropdown,
        type: filterDefinitionUsedInDropdown.type,
        value: selectedEntity.id,
        displayAvatarUrl: selectedEntity.avatarUrl,
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

      removeFilter(filterDefinitionUsedInDropdown.key);
    } else {
      setIsAllEntitySelected(true);

      setFilterDropdownSelectedEntityId(null);

      upsertFilter({
        displayValue: filterDefinitionUsedInDropdown.selectAllLabel,
        key: filterDefinitionUsedInDropdown.key,
        operand: ViewFilterOperand.IsNotNull,
        type: filterDefinitionUsedInDropdown.type,
        value: '',
      });
    }
  };

  useEffect(() => {
    if (!filterCurrentlyEdited) {
      setFilterDropdownSelectedEntityId(null);
    } else {
      setFilterDropdownSelectedEntityId(filterCurrentlyEdited.value);
      setIsAllEntitySelected(
        filterCurrentlyEdited.operand === ViewFilterOperand.IsNotNull,
      );
    }
  }, [
    filterCurrentlyEdited,
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
