import { Context, useCallback, useEffect } from 'react';

import { DropdownButton } from '@/ui/dropdown/components/DropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { FilterDropdownId } from '../constants/FilterDropdownId';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';
import { filterDropdownSearchInputScopedState } from '../states/filterDropdownSearchInputScopedState';
import { isFilterDropdownOperandSelectUnfoldedScopedState } from '../states/isFilterDropdownOperandSelectUnfoldedScopedState';
import { selectedOperandInDropdownScopedState } from '../states/selectedOperandInDropdownScopedState';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  context: Context<string | null>;
  hotkeyScope: HotkeyScope;
};

export function MultipleFiltersDropdownButton({
  context,
  hotkeyScope,
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

  const { isDropdownButtonOpen } = useDropdownButton({
    dropdownId: FilterDropdownId,
  });

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

  useEffect(() => {
    if (!isDropdownButtonOpen) {
      resetState();
    }
  }, [isDropdownButtonOpen, resetState]);

  return (
    <DropdownButton
      dropdownId={FilterDropdownId}
      buttonComponents={<MultipleFiltersButton />}
      dropdownComponents={<MultipleFiltersDropdownContent context={context} />}
      dropdownHotkeyScope={hotkeyScope}
    />
  );
}
