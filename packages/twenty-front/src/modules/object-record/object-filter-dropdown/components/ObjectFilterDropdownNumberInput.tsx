import { ChangeEvent, useCallback, useState } from 'react';
import { v4 } from 'uuid';

import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const ObjectFilterDropdownNumberInput = () => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const filterDefinitionUsedInDropdown = useRecoilComponentValueV2(
    filterDefinitionUsedInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const [hasFocused, setHasFocused] = useState(false);

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

          applyRecordFilter({
            id: selectedFilter?.id ? selectedFilter.id : v4(),
            fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
            value: newValue,
            operand: selectedOperandInDropdown,
            displayValue: newValue,
            definition: filterDefinitionUsedInDropdown,
            viewFilterGroupId: selectedFilter?.viewFilterGroupId,
          });
        }}
      />
    )
  );
};
