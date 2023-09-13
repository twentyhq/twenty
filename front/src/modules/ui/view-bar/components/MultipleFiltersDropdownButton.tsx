import { Context, useCallback } from 'react';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';
import { FilterDropdownKey } from '../types/FilterDropdownKey';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: string;
};

export function MultipleFiltersDropdownButton({
  context,
}: MultipleFiltersDropdownButtonProps) {
  const [, setIsFilterDropdownOperandSelectUnfolded] = useRecoilScopedState(
    isFilterDropdownOperandSelectUnfoldedScopedState,
    context,
  );

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    context,
  );

  const [, setFilterDropdownSearchInput] = useRecoilScopedState(
    filterDropdownSearchInputScopedState,
    context,
  );

  const [, setSelectedOperandInDropdown] = useRecoilScopedState(
    selectedOperandInDropdownScopedState,
    context,
  );

  const resetState = useCallback(() => {
    setIsFilterDropdownOperandSelectUnfolded(false);
    setFilterDefinitionUsedInDropdown(null);
    setSelectedOperandInDropdown(null);
    setFilterDropdownSearchInput('');
  }, [
    setFilterDefinitionUsedInDropdown,
    setSelectedOperandInDropdown,
    setFilterDropdownSearchInput,
    setIsFilterDropdownOperandSelectUnfolded,
  ]);
  return (
    <DropdownButton
      dropdownKey={FilterDropdownKey}
      buttonComponents={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent context={context} />}
      onDropdownToggle={() => {
        resetState();
      }}
    />
  );
}
