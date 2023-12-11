import { ChangeEvent } from 'react';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

export const ObjectFilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    objectFilterDropdownSearchInput,
    setObjectFilterDropdownSearchInput,
    selectedFilter,
    selectFilter,
  } = useFilterDropdown();

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
