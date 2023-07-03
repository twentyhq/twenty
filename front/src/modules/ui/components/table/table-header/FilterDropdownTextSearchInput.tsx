import { ChangeEvent } from 'react';

import { useRemoveSelectedFilter } from '@/filters-and-sorts/hooks/useRemoveSelectedFilter';
import { useSelectedFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useSelectedFilterCurrentlyEditedInDropdown';
import { useUpsertSelectedFilter } from '@/filters-and-sorts/hooks/useUpsertSelectedFilter';
import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedFilterInDropdownScopedState } from '@/filters-and-sorts/states/selectedFilterInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownTextSearchInput() {
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

  const upsertSelectedFilter = useUpsertSelectedFilter();
  const removeSelectedFilter = useRemoveSelectedFilter();

  const selectedFilterCurrentlyEditedInDropdown =
    useSelectedFilterCurrentlyEditedInDropdown();

  return (
    selectedFilterInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="text"
        placeholder={selectedFilterInDropdown.label}
        value={
          selectedFilterCurrentlyEditedInDropdown?.value ?? filterSearchInput
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterSearchInput(event.target.value);

          if (event.target.value === '') {
            removeSelectedFilter(selectedFilterInDropdown.field);
          } else {
            upsertSelectedFilter({
              field: selectedFilterInDropdown.field,
              type: selectedFilterInDropdown.type,
              value: event.target.value,
              operand: selectedOperandInDropdown,
              displayValue: event.target.value,
            });
          }
        }}
      />
    )
  );
}
