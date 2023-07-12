import { ChangeEvent, Context } from 'react';

import { useFilterCurrentlyEdited } from '@/lib/filters-and-sorts/hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '@/lib/filters-and-sorts/hooks/useRemoveFilter';
import { useUpsertFilter } from '@/lib/filters-and-sorts/hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '@/lib/filters-and-sorts/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/lib/filters-and-sorts/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/lib/filters-and-sorts/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

export function FilterDropdownTextSearchInput({
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

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(filterDropdownSearchInputScopedState, context);

  const upsertFilter = useUpsertFilter(context);
  const removeFilter = useRemoveFilter(context);

  const filterCurrentlyEdited = useFilterCurrentlyEdited(context);

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <input
        type="text"
        placeholder={filterDefinitionUsedInDropdown.label}
        value={filterCurrentlyEdited?.value ?? filterDropdownSearchInput}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);

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
