import { ChangeEvent, Context } from 'react';

import { DropdownMenuInput } from '@/ui/dropdown/components/DropdownMenuInput';
import { filterDefinitionUsedInDropdownScopedState } from '@/ui/filter-n-sort/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/filter-n-sort/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/filter-n-sort/states/selectedOperandInDropdownScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

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
      <DropdownMenuInput
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
