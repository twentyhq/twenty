import { ChangeEvent, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

export const ObjectFilterDropdownSearchInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    objectFilterDropdownSearchInputState,
    setObjectFilterDropdownSearchInput,
  } = useFilterDropdown();
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
        value={objectFilterDropdownSearchInput}
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setObjectFilterDropdownSearchInput(event.target.value);
        }}
      />
    )
  );
};
