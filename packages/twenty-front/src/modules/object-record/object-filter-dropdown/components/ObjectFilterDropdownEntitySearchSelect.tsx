import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { SingleEntitySelectMenuItems } from '@/object-record/relation-picker/components/SingleEntitySelectMenuItems';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const ObjectFilterDropdownEntitySearchSelect = ({
  entitiesForSelect,
}: {
  entitiesForSelect: EntitiesForMultipleEntitySelect<EntityForSelect>;
}) => {
  const {
    setObjectFilterDropdownSelectedEntityId,
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const selectedFilter = useRecoilValue(selectedFilterState);

  const { closeDropdown } = useDropdown(OBJECT_FILTER_DROPDOWN_ID);

  const [isAllEntitySelected, setIsAllEntitySelected] = useState(false);

  const handleRecordSelected = (
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

    setObjectFilterDropdownSelectedEntityId(selectedEntity.id);

    selectFilter?.({
      displayValue: selectedEntity.name,
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      operand: selectedOperandInDropdown,
      value: selectedEntity.id,
      displayAvatarUrl: selectedEntity.avatarUrl,
      definition: filterDefinitionUsedInDropdown,
    });
    closeDropdown();
  };

  const isAllEntitySelectShown =
    !!filterDefinitionUsedInDropdown?.selectAllLabel &&
    !!filterDefinitionUsedInDropdown?.SelectAllIcon &&
    (isAllEntitySelected ||
      filterDefinitionUsedInDropdown?.selectAllLabel
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()));

  const handleAllEntitySelectClick = () => {
    if (
      !filterDefinitionUsedInDropdown ||
      !selectedOperandInDropdown ||
      !filterDefinitionUsedInDropdown.selectAllLabel
    ) {
      return;
    }

    setIsAllEntitySelected(true);
    setObjectFilterDropdownSelectedEntityId(null);
    closeDropdown();

    selectFilter?.({
      displayValue: filterDefinitionUsedInDropdown.selectAllLabel,
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      operand: ViewFilterOperand.IsNotNull,
      value: '',
      definition: filterDefinitionUsedInDropdown,
    });
  };

  useEffect(() => {
    if (!selectedFilter) {
      setObjectFilterDropdownSelectedEntityId(null);
    } else {
      setObjectFilterDropdownSelectedEntityId(selectedFilter.value);
      setIsAllEntitySelected(
        selectedFilter.operand === ViewFilterOperand.IsNotNull,
      );
    }
  }, [
    selectedFilter,
    setObjectFilterDropdownSelectedEntityId,
    entitiesForSelect.selectedEntities,
  ]);

  return (
    <SingleEntitySelectMenuItems
      entitiesToSelect={entitiesForSelect.entitiesToSelect}
      selectedEntity={entitiesForSelect.selectedEntities[0]}
      loading={entitiesForSelect.loading}
      onEntitySelected={handleRecordSelected}
      SelectAllIcon={filterDefinitionUsedInDropdown?.SelectAllIcon}
      selectAllLabel={filterDefinitionUsedInDropdown?.selectAllLabel}
      isAllEntitySelected={isAllEntitySelected}
      isAllEntitySelectShown={isAllEntitySelectShown}
      onAllEntitySelected={handleAllEntitySelectClick}
    />
  );
};
