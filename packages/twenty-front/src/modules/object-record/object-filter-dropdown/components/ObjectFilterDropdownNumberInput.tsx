import { ChangeEvent, useEffect, useRef, useState } from 'react';
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

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);

  const [inputValue, setInputValue] = useState(selectedFilter?.value || '');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(selectedFilter?.value || '');
  }, [selectedFilter]);

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.select();
    }
  }, []);

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuInput
        ref={inputRef}
        autoFocus
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={inputValue}
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
