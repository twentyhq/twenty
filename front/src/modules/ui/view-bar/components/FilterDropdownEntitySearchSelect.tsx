import { useEffect, useState } from 'react';

import { EntitiesForMultipleEntitySelect } from '@/ui/input/relation-picker/components/MultipleEntitySelect';
import { SingleEntitySelectBase } from '@/ui/input/relation-picker/components/SingleEntitySelectBase';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useFilterCurrentlyEdited } from '@/ui/view-bar/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '@/ui/view-bar/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/ui/view-bar/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/view-bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSelectedEntityIdScopedState } from '@/ui/view-bar/states/filterDropdownSelectedEntityIdScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/view-bar/states/selectedOperandInDropdownScopedState';

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

  const isAllEnititySelectShown =
    !!filterDefinitionUsedInDropdown?.selectAllLabel &&
    !!filterDefinitionUsedInDropdown?.SelectAllIcon &&
    (isAllEntitySelected ||
      filterDefinitionUsedInDropdown?.selectAllLabel
        .toLocaleLowerCase()
        .includes(filterDropdownSearchInput.toLocaleLowerCase()));

  const handleAllEntitySelectClick = () => {
    if (
      !filterDefinitionUsedInDropdown ||
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
        isAllEnititySelectShown={isAllEnititySelectShown}
        onAllEntitySelected={handleAllEntitySelectClick}
      />
    </>
  );
};
