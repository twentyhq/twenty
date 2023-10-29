import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useFilter } from '../hooks/useFilter';

export const FilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    filterDropdownSearchInput,
    setFilterDropdownSearchInput,
    selectedFilter,
    onFilterSelect,
  } = useFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={selectedFilter?.value ?? filterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);

          onFilterSelect?.({
            fieldId: filterDefinitionUsedInDropdown.fieldId,
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
