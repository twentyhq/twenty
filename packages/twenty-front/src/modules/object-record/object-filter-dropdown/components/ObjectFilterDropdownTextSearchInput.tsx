import { ChangeEvent, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useApplyRecordFilter } from '@/object-record/object-filter-dropdown/hooks/useApplyRecordFilter';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

export const ObjectFilterDropdownTextSearchInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    objectFilterDropdownSearchInputState,
    setObjectFilterDropdownSearchInput,
    selectedFilterState,
  } = useFilterDropdown();

  const [filterId] = useState(v4());
  const [hasFocused, setHasFocused] = useState(false);

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const selectedFilter = useRecoilValue(selectedFilterState);

  const { applyRecordFilter } = useApplyRecordFilter();

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
      <DropdownMenuSearchInput
        ref={handleInputRef}
        autoFocus
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={selectedFilter?.value ?? objectFilterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setObjectFilterDropdownSearchInput(event.target.value);

          applyRecordFilter({
            id: selectedFilter?.id ?? filterId,
            fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
            value: event.target.value,
            operand: selectedOperandInDropdown,
            displayValue: event.target.value,
            definition: filterDefinitionUsedInDropdown,
            viewFilterGroupId: selectedFilter?.viewFilterGroupId,
          });
        }}
      />
    )
  );
};
