import { ChangeEvent, Context } from 'react';

import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

export function FilterDropdownEntitySearchInput({
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

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearch
        type="text"
        value={filterDropdownSearchInput}
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);
        }}
      />
    )
  );
}
