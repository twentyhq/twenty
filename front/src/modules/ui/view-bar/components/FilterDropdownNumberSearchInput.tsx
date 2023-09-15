import { ChangeEvent } from 'react';

import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { useUpsertFilter } from '../hooks/useUpsertFilter';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

export function FilterDropdownNumberSearchInput() {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const upsertFilter = useUpsertFilter();
  const removeFilter = useRemoveFilter();

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuInput
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.value === '') {
            removeFilter(filterDefinitionUsedInDropdown.key);
          } else {
            upsertFilter({
              key: filterDefinitionUsedInDropdown.key,
              type: filterDefinitionUsedInDropdown.type,
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
