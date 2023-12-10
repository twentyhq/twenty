import { ChangeEvent } from 'react';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

type ObjectFilterDropdownRecordSearchInputProps = {
  filterDropdownId?: string;
};

// ObjectFilterDropdownEntitySearchInput

export const ObjectFilterDropdownRecordSearchInput = ({
  filterDropdownId,
}: ObjectFilterDropdownRecordSearchInputProps) => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    objectFilterDropdownSearchInput,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown({ filterDropdownId });

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
