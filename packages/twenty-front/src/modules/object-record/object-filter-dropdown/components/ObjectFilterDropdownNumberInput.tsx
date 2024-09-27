import { ChangeEvent, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';

export const ObjectFilterDropdownNumberInput = () => {
  const {
    selectedOperandInDropdownState,
    filterDefinitionUsedInDropdownState,
    selectedFilterState,
    selectFilter,
  } = useFilterDropdown();
  const [hasFocused, setHasFocused] = useState(false);

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);

  const [inputValue, setInputValue] = useState(
    () => selectedFilter?.value || '',
  );

  const handleInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (Boolean(node) && !hasFocused) {
        node?.focus();
        node?.select();
        setHasFocused(true);
      }
    },
    [hasFocused],
  );
  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuInput
        ref={handleInputRef}
        value={inputValue}
        autoFocus
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const newValue = event.target.value;
          setInputValue(newValue);
          selectFilter?.({
            id: selectedFilter?.id ? selectedFilter.id : v4(),
            fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
            value: newValue,
            operand: selectedOperandInDropdown,
            displayValue: newValue,
            definition: filterDefinitionUsedInDropdown,
          });
        }}
      />
    )
  );
};
