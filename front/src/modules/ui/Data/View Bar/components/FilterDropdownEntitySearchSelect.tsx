import { useEffect, useState } from 'react';

import { useFilterCurrentlyEdited } from '@/ui/Data/View Bar/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '@/ui/Data/View Bar/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/ui/Data/View Bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/Data/View Bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/Data/View Bar/states/filterDropdownSelectedEntityIdScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/Data/View Bar/states/selectedOperandInDropdownScopedState';
import { EntitiesForMultipleEntitySelect } from '@/ui/Input/Relation Picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/ui/Input/Relation Picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/ui/Input/Relation Picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { FilterOperand } from '../types/FilterOperand';

export const FilterDropdownEntitySearchSelect = ({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<EntityForSelect>;
}) => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [isAllEntitySelected, setIsAllEntitySelected] = useState(false);

  const [filterDropdownSelectedEntityId, setFilterDropdownSelectedEntityId] =
    useRecoilScopedState(
      filterDropdownSelectedEntityIdScopedState,
      ViewBarRecoilScopeContext,
    );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

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

  const [filterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    ViewBarRecoilScopeContext,
  );

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
        operand: FilterOperand.IsNotNull,
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
        filterCurrentlyEdited.operand === FilterOperand.IsNotNull,
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
