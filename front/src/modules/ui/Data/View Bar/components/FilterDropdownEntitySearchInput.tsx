import { ChangeEvent } from 'react';

import { filterDefinitionUsedInDropdownScopedState } from '@/ui/Data/View Bar/states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '@/ui/Data/View Bar/states/filterDropdownSearchInputScopedState';
import { selectedOperandInDropdownScopedState } from '@/ui/Data/View Bar/states/selectedOperandInDropdownScopedState';
import { DropdownMenuSearchInput } from '@/ui/Layout/Dropdown/components/DropdownMenuSearchInput';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useViewBarContext } from '../hooks/useViewBarContext';

export const FilterDropdownEntitySearchInput = () => {
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [filterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [selectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [filterDropdownSearchInput, setFilterDropdownSearchInput] =
    useRecoilScopedState(
      filterDropdownSearchInputScopedState,
      ViewBarRecoilScopeContext,
    );

  return (
    filterDefinitionUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={filterDropdownSearchInput}
        placeholder={filterDefinitionUsedInDropdown.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setFilterDropdownSearchInput(event.target.value);
        }}
      />
    )
  );
};
