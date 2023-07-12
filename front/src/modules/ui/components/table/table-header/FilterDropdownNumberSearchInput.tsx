import { ChangeEvent } from 'react';

import { useRemoveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
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

  const upsertActiveTableFilter = useUpsertFilter(TableContext);
  const removeActiveTableFilter = useRemoveFilter(TableContext);

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
