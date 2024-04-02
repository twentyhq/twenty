import { ChangeEvent } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

export const ObjectFilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    objectFilterDropdownSearchInputState,
    setObjectFilterDropdownSearchInput,
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

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={selectedFilter?.value ?? objectFilterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setObjectFilterDropdownSearchInput(event.target.value);

          selectFilter?.({
            fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
            value: event.target.value,
            operand: selectedOperandInDropdown,
            displayValue: event.target.value,
            definition: filterDefinitionUsedInDropdown,
          });
        }}
      />
    )
  );
};
