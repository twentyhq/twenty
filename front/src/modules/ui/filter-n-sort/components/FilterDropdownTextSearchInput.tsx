import { ChangeEvent, Context } from 'react';

import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilterCurrentlyEdited } from '../hooks/useFilterCurrentlyEdited';
import { useRemoveFilter } from '../hooks/useRemoveFilter';
import { useUpsertFilter } from '../hooks/useUpsertFilter';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

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
      <DropdownMenuSearch
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
