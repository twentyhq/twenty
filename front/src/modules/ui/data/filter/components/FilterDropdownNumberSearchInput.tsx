import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useFilter } from '../hooks/useFilter';

export const FilterDropdownNumberSearchInput = () => {
  const {
    selectedOperandInDropdown,
    filterDefinitionUsedInDropdown,
    onFilterSelect,
  } = useFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
