import { ChangeEvent } from 'react';

import { useActiveTableFilterCurrentlyEditedInDropdown } from '@/lib/filters-and-sorts/hooks/useActiveFilterCurrentlyEditedInDropdown';
import { useRemoveActiveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveActiveFilter';
import { useUpsertActiveFilter } from '@/lib/filters-and-sorts/hooks/useUpsertActiveFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownTextSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(filterDropdownSearchInputScopedState, TableContext);

  const upsertActiveTableFilter = useUpsertActiveFilter(TableContext);
  const removeActiveTableFilter = useRemoveActiveFilter(TableContext);

  const activeFilterCurrentlyEditedInDropdown =
    useActiveTableFilterCurrentlyEditedInDropdown(TableContext);

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
