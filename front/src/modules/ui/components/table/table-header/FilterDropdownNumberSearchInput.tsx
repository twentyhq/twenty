import { ChangeEvent } from 'react';

import { useRemoveActiveTableFilter } from '@/filters-and-sorts/hooks/useRemoveActiveTableFilter';
import { useUpsertActiveTableFilter } from '@/filters-and-sorts/hooks/useUpsertActiveTableFilter';
import { selectedOperandInDropdownScopedState } from '@/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { tableFilterDefinitionUsedInDropdownScopedState } from '@/filters-and-sorts/states/tableFilterDefinitionUsedInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownNumberSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    tableFilterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertActiveTableFilter();
  const removeActiveTableFilter = useRemoveActiveTableFilter();

  return (
    tableFilterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="number"
        placeholder={tableFilterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
