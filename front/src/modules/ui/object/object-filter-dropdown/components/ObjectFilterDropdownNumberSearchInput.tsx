import { ChangeEvent } from 'react';

import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

import { useFilter } from '../hooks/useFilter';

export const ObjectFilterDropdownNumberSearchInput = () => {
  const {
    selectedOperandInDropdown,
    filterDefinitionUsedInDropdown,
    selectFilter,
  } = useFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
