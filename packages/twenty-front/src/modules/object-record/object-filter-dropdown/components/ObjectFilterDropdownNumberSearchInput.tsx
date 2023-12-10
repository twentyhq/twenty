import { ChangeEvent } from 'react';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

type ObjectFilterDropdownNumberSearchInputProps = {
  filterDropdownId?: string;
};

export const ObjectFilterDropdownNumberSearchInput = ({
  filterDropdownId,
}: ObjectFilterDropdownNumberSearchInputProps) => {
  const {
    selectedOperandInDropdown,
    filterDefinitionUsedInDropdown,
    selectFilter,
  } = useFilterDropdown({ filterDropdownId });

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
