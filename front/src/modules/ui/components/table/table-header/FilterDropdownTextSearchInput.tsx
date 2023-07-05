import { ChangeEvent } from 'react';

import { useActiveTableFilterCurrentlyEditedInDropdown } from '@/filters-and-sorts/hooks/useActiveFilterCurrentlyEditedInDropdown';
import { useRemoveActiveTableFilter } from '@/filters-and-sorts/hooks/useRemoveActiveTableFilter';
import { useUpsertActiveTableFilter } from '@/filters-and-sorts/hooks/useUpsertActiveTableFilter';
import { filterDropdownSearchInputScopedState } from '@/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownTextSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(filterDropdownSearchInputScopedState, TableContext);

  const upsertActiveTableFilter = useUpsertActiveTableFilter();
  const removeActiveTableFilter = useRemoveActiveTableFilter();

  const activeFilterCurrentlyEditedInDropdown =
    useActiveTableFilterCurrentlyEditedInDropdown();

  return (
    tableFilterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="text"
        placeholder={tableFilterDefinitionUsedInDropdown.label}
        value={
          activeFilterCurrentlyEditedInDropdown?.value ??
          filterDropdownSearchInput
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);

          if (event.target.value === '') {
            removeActiveTableFilter(tableFilterDefinitionUsedInDropdown.field);
          } else {
            upsertActiveTableFilter({
              field: tableFilterDefinitionUsedInDropdown.field,
              type: tableFilterDefinitionUsedInDropdown.type,
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
