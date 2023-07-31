import { ChangeEvent, Context } from 'react';

import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { useUpsertFilter } from '../hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

export function FilterDropdownNumberSearchInput({
  context,
}: {
  context: Context<string | null>;
}) {
  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const upsertFilter = useUpsertFilter(context);
  const removeFilter = useRemoveFilter(context);

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearch
        type="number"
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          if (event.target.value === '') {
            removeFilter(filterDefinitionUsedInDropdown.field);
          } else {
            upsertFilter({
              field: filterDefinitionUsedInDropdown.field,
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
