import { ChangeEvent } from 'react';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

export const ObjectFilterDropdownRecordSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    objectFilterDropdownSearchInput,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={objectFilterDropdownSearchInput}
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setObjectFilterDropdownSearchInput(event.target.value);
        }}
      />
    )
  );
};
