import { ChangeEvent } from 'react';

import { useRemoveActiveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveActiveFilter';
import { useUpsertActiveFilter } from '@/lib/filters-and-sorts/hooks/useUpsertActiveFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';

export function FilterDropdownNumberSearchInput() {
  const [tableFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    TableContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    TableContext,
  );

  const upsertActiveTableFilter = useUpsertActiveFilter();
  const removeActiveTableFilter = useRemoveActiveFilter();

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
