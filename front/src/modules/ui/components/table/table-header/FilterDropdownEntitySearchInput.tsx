import { ChangeEvent } from 'react';

import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownEntitySearchInput() {
  const [selectedFilterInDropdown] = useRecoilScopedState(
    selectedFilterInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [filterSearchInput, setFilterSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    TableContext,
  );

  return (
    selectedFilterInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="text"
        value={filterSearchInput}
        placeholder={selectedFilterInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterSearchInput(event.target.value);
        }}
      />
    )
  );
}
